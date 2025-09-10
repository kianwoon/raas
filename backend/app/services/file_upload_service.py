import pandas as pd
import io
import json
import structlog
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime
import uuid
import base64
from pathlib import Path

from app.services.minio_service import MinioService
from app.models.data_source import DataSource, DataSourceType, DataSourceStatus, DataType
from app.schemas.data_source import DataSourceCreate, FileUploadResponse, SchemaInferenceResponse
from app.core.database import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession

logger = structlog.get_logger()

class FileUploadService:
    """Service for handling file uploads and data processing."""
    
    def __init__(self):
        self.minio_service = MinioService()
        self.supported_file_types = {
            'csv': 'text/csv',
            'parquet': 'application/octet-stream',
            'json': 'application/json',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'xls': 'application/vnd.ms-excel',
            'pkl': 'application/octet-stream',
            'pickle': 'application/octet-stream',
            'onnx': 'application/octet-stream'
        }
        
        self.model_file_types = {
            'pkl': 'pickle',
            'pickle': 'pickle',
            'onnx': 'onnx'
        }
    
    async def upload_file(
        self, 
        file_content: str, 
        file_name: str, 
        user_id: uuid.UUID, 
        organization_id: uuid.UUID,
        description: Optional[str] = None,
        protected_attributes: Optional[List[str]] = None,
        sample_size: int = 100
    ) -> FileUploadResponse:
        """Upload and process a data file."""
        try:
            # Decode base64 content
            file_bytes = base64.b64decode(file_content)
            file_obj = io.BytesIO(file_bytes)
            
            # Determine file type
            file_extension = file_name.lower().split('.')[-1]
            if file_extension not in self.supported_file_types:
                raise ValueError(f"Unsupported file type: {file_extension}")
            
            # Read file based on type
            df = await self._read_file(file_obj, file_extension)
            
            # Basic validation
            if df.empty:
                raise ValueError("File is empty or could not be read")
            
            # Generate unique file path in MinIO
            object_name = f"data_sources/{user_id}/{uuid.uuid4()}/{file_name}"
            
            # Upload to MinIO
            content_type = self.supported_file_types[file_extension]
            file_url = self.minio_service.upload_file_content(
                file_bytes, 
                object_name, 
                content_type
            )
            
            # Infer schema and generate sample data
            inferred_schema = await self._infer_schema(df)
            sample_data = df.head(min(sample_size, len(df))).to_dict('records')
            
            # Create data source record
            data_source_data = DataSourceCreate(
                name=Path(file_name).stem,
                description=description,
                source_type=DataSourceType.FILE_UPLOAD,
                protected_attributes=protected_attributes or [],
                file_name=file_name,
                sample_data_size=sample_size
            )
            
            # Save to database
            data_source = await self._create_data_source(
                data_source_data, 
                file_url, 
                file_name, 
                len(file_bytes), 
                file_extension,
                inferred_schema,
                sample_data,
                user_id,
                organization_id,
                df
            )
            
            logger.info(f"File uploaded successfully: {file_name}", data_source_id=str(data_source.id))
            
            return FileUploadResponse(
                message="File uploaded successfully",
                data_source_id=data_source.id,
                file_name=file_name,
                file_size=len(file_bytes),
                file_type=file_extension,
                preview_data=sample_data,
                inferred_schema=inferred_schema
            )
            
        except Exception as e:
            logger.error("File upload failed", error=str(e))
            raise
    
    async def _read_file(self, file_obj: io.BytesIO, file_extension: str) -> pd.DataFrame:
        """Read file based on extension."""
        try:
            if file_extension == 'csv':
                return pd.read_csv(file_obj, nrows=10000)  # Limit for initial processing
            elif file_extension == 'parquet':
                return pd.read_parquet(file_obj)
            elif file_extension == 'json':
                return pd.read_json(file_obj, orient='records')
            elif file_extension in ['xlsx', 'xls']:
                return pd.read_excel(file_obj, nrows=10000)
            else:
                raise ValueError(f"Unsupported file type: {file_extension}")
        except Exception as e:
            logger.error(f"Failed to read file: {e}")
            raise
    
    async def _infer_schema(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Infer schema from DataFrame."""
        try:
            schema_info = {
                "columns": [],
                "data_types": {},
                "sample_stats": {},
                "nullable_columns": [],
                "unique_counts": {}
            }
            
            for column in df.columns:
                col_data = df[column]
                dtype = str(col_data.dtype)
                
                # Map pandas dtype to our DataType enum
                if 'int' in dtype:
                    data_type = DataType.INTEGER
                elif 'float' in dtype:
                    data_type = DataType.FLOAT
                elif 'bool' in dtype:
                    data_type = DataType.BOOLEAN
                elif 'datetime' in dtype:
                    data_type = DataType.DATETIME
                elif 'object' in dtype:
                    # Check if it's categorical
                    unique_count = col_data.nunique()
                    if unique_count / len(col_data) < 0.1:  # Less than 10% unique values
                        data_type = DataType.CATEGORICAL
                    else:
                        data_type = DataType.STRING
                else:
                    data_type = DataType.STRING
                
                schema_info["columns"].append({
                    "name": column,
                    "data_type": data_type.value,
                    "pandas_dtype": dtype,
                    "nullable": col_data.isnull().any()
                })
                
                schema_info["data_types"][column] = data_type.value
                
                # Generate sample statistics
                if data_type in [DataType.INTEGER, DataType.FLOAT]:
                    schema_info["sample_stats"][column] = {
                        "mean": float(col_data.mean()) if not col_data.empty else None,
                        "std": float(col_data.std()) if not col_data.empty else None,
                        "min": float(col_data.min()) if not col_data.empty else None,
                        "max": float(col_data.max()) if not col_data.empty else None
                    }
                elif data_type == DataType.STRING:
                    schema_info["sample_stats"][column] = {
                        "avg_length": float(col_data.astype(str).str.len().mean()),
                        "max_length": int(col_data.astype(str).str.len().max()),
                        "unique_values": int(col_data.nunique())
                    }
                
                schema_info["nullable_columns"].append(column) if col_data.isnull().any() else None
                schema_info["unique_counts"][column] = int(col_data.nunique())
            
            return schema_info
            
        except Exception as e:
            logger.error(f"Schema inference failed: {e}")
            raise
    
    async def _create_data_source(
        self,
        data_source_data: DataSourceCreate,
        file_url: str,
        file_name: str,
        file_size: int,
        file_type: str,
        schema_info: Dict[str, Any],
        sample_data: List[Dict[str, Any]],
        user_id: uuid.UUID,
        organization_id: uuid.UUID,
        df: pd.DataFrame
    ) -> DataSource:
        """Create data source record in database."""
        try:
            async with AsyncSessionLocal() as session:
                data_source = DataSource(
                    name=data_source_data.name,
                    description=data_source_data.description,
                    source_type=data_source_data.source_type,
                    status=DataSourceStatus.ACTIVE,
                    file_path=file_url,
                    file_name=file_name,
                    file_size=file_size,
                    file_type=file_type,
                    schema_info=schema_info,
                    row_count=len(df),
                    column_count=len(df.columns),
                    sample_data=sample_data,
                    protected_attributes=data_source_data.protected_attributes,
                    created_by=user_id,
                    organization_id=organization_id,
                    is_processed=True,
                    processing_completed_at=datetime.utcnow()
                )
                
                session.add(data_source)
                await session.commit()
                await session.refresh(data_source)
                
                return data_source
                
        except Exception as e:
            logger.error(f"Failed to create data source: {e}")
            raise
    
    async def get_data_preview(
        self, 
        data_source_id: uuid.UUID, 
        limit: int = 100, 
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get data preview from a data source."""
        try:
            async with AsyncSessionLocal() as session:
                data_source = await session.get(DataSource, data_source_id)
                if not data_source:
                    raise ValueError(f"Data source not found: {data_source_id}")
                
                if data_source.sample_data:
                    return data_source.sample_data[offset:offset + limit]
                
                # If no sample data, read from file
                if data_source.file_path:
                    file_content = self.minio_service.download_file_content(
                        data_source.file_path.split('/')[-1]
                    )
                    df = await self._read_file(io.BytesIO(file_content), data_source.file_type)
                    return df.head(limit + offset).iloc[offset:].to_dict('records')
                
                return []
                
        except Exception as e:
            logger.error(f"Failed to get data preview: {e}")
            raise
    
    async def validate_file_format(self, file_name: str, file_content: str) -> bool:
        """Validate file format before upload."""
        try:
            file_extension = file_name.lower().split('.')[-1]
            if file_extension not in self.supported_file_types:
                return False
            
            # Try to decode and read the file
            file_bytes = base64.b64decode(file_content)
            file_obj = io.BytesIO(file_bytes)
            
            df = await self._read_file(file_obj, file_extension)
            return not df.empty
            
        except Exception as e:
            logger.error(f"File format validation failed: {e}")
            return False
    
    async def get_supported_file_types(self) -> List[str]:
        """Get list of supported file types."""
        return list(self.supported_file_types.keys())
    
    async def get_file_size_limit(self) -> int:
        """Get maximum file size limit."""
        from app.core.config import settings
        return settings.MAX_FILE_SIZE
    
    async def upload_model_file(
        self, 
        file_content: str, 
        file_name: str, 
        user_id: uuid.UUID, 
        organization_id: uuid.UUID,
        model_id: Optional[uuid.UUID] = None,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload a model file (pickle/ONNX)."""
        try:
            # Decode base64 content
            file_bytes = base64.b64decode(file_content)
            file_obj = io.BytesIO(file_bytes)
            
            # Determine file type
            file_extension = file_name.lower().split('.')[-1]
            if file_extension not in self.model_file_types:
                raise ValueError(f"Unsupported model file type: {file_extension}")
            
            # Check file size
            from app.core.config import settings
            if len(file_bytes) > settings.MAX_MODEL_FILE_SIZE:
                raise ValueError(f"Model file size exceeds limit of {settings.MAX_MODEL_FILE_SIZE}")
            
            # Generate unique file path in MinIO
            object_name = f"models/{user_id}/{model_id or uuid.uuid4()}/{file_name}"
            
            # Upload to MinIO
            content_type = self.supported_file_types[file_extension]
            file_url = self.minio_service.upload_file_content(
                file_bytes, 
                object_name, 
                content_type
            )
            
            # Validate model file
            model_info = await self._validate_model_file(file_obj, file_extension)
            
            logger.info(f"Model file uploaded successfully: {file_name}", 
                       file_size=len(file_bytes), model_type=model_info.get("model_type"))
            
            return {
                "message": "Model file uploaded successfully",
                "file_url": file_url,
                "file_name": file_name,
                "file_size": len(file_bytes),
                "file_type": file_extension,
                "model_info": model_info,
                "object_name": object_name
            }
            
        except Exception as e:
            logger.error("Model file upload failed", error=str(e))
            raise
    
    async def _validate_model_file(self, file_obj: io.BytesIO, file_extension: str) -> Dict[str, Any]:
        """Validate model file and extract metadata."""
        try:
            model_info = {
                "model_type": "unknown",
                "is_valid": True,
                "warnings": [],
                "metadata": {}
            }
            
            if file_extension in ['pkl', 'pickle']:
                try:
                    import pickle
                    # Reset file pointer
                    file_obj.seek(0)
                    model = pickle.load(file_obj)
                    
                    # Try to determine model type
                    model_class = model.__class__.__name__
                    model_module = model.__class__.__module__
                    
                    model_info["model_type"] = f"{model_module}.{model_class}"
                    model_info["metadata"] = {
                        "class_name": model_class,
                        "module": model_module,
                        "has_predict": hasattr(model, 'predict'),
                        "has_fit": hasattr(model, 'fit'),
                        "has_transform": hasattr(model, 'transform')
                    }
                    
                    # Check if it's a scikit-learn model
                    if 'sklearn' in model_module:
                        model_info["framework"] = "scikit-learn"
                    # Check if it's a PyTorch model
                    elif 'torch' in model_module:
                        model_info["framework"] = "pytorch"
                    # Check if it's a TensorFlow model
                    elif 'tensorflow' in model_module or 'keras' in model_module:
                        model_info["framework"] = "tensorflow"
                    
                except Exception as e:
                    model_info["is_valid"] = False
                    model_info["warnings"].append(f"Failed to load pickle file: {str(e)}")
                    
            elif file_extension == 'onnx':
                try:
                    import onnx
                    # Reset file pointer
                    file_obj.seek(0)
                    model = onnx.load(file_obj)
                    
                    model_info["model_type"] = "ONNX"
                    model_info["framework"] = "ONNX"
                    model_info["metadata"] = {
                        "producer_name": model.producer_name,
                        "producer_version": model.producer_version,
                        "domain": model.domain,
                        "model_version": model.model_version,
                        "graph_input_count": len(model.graph.input),
                        "graph_output_count": len(model.graph.output),
                        "node_count": len(model.graph.node)
                    }
                    
                except Exception as e:
                    model_info["is_valid"] = False
                    model_info["warnings"].append(f"Failed to load ONNX file: {str(e)}")
            
            return model_info
            
        except Exception as e:
            logger.error(f"Model file validation failed: {e}")
            return {
                "model_type": "unknown",
                "is_valid": False,
                "warnings": [f"Validation error: {str(e)}"],
                "metadata": {}
            }
    
    async def get_supported_model_file_types(self) -> List[str]:
        """Get list of supported model file types."""
        return list(self.model_file_types.keys())