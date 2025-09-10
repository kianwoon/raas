from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.auth import get_current_user, get_current_active_user
from app.models.user import User
from app.schemas.data_source import (
    DataSourceCreate, DataSourceUpdate, DataSourceResponse,
    SchemaMappingCreate, SchemaMappingUpdate, SchemaMappingResponse,
    DataValidationCreate, DataValidationUpdate, DataValidationResponse,
    FileUploadResponse, ConnectorTestResponse, DataPreviewRequest,
    SchemaInferenceRequest, SchemaInferenceResponse, ValidationSummary,
    ProtectedAttributeConfigCreate, ProtectedAttributeConfigUpdate, 
    ProtectedAttributeConfigResponse
)
from app.services.file_upload_service import FileUploadService
from app.services.connector_service import ConnectorService
from app.services.schema_mapping_service import SchemaMappingService
from app.services.data_validation_service import DataValidationService
from app.models.data_source import DataSourceType, DataSource
import structlog

logger = structlog.get_logger()

router = APIRouter()

# Initialize services
file_upload_service = FileUploadService()
connector_service = ConnectorService()
schema_mapping_service = SchemaMappingService()
data_validation_service = DataValidationService()

# Data Source endpoints
@router.post("/data-sources", response_model=DataSourceResponse)
async def create_data_source(
    data_source: DataSourceCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new data source."""
    try:
        # For file uploads, handle file content
        if data_source.source_type == DataSourceType.FILE_UPLOAD:
            if not data_source.file_content or not data_source.file_name:
                raise HTTPException(status_code=400, detail="File content and name are required for file uploads")
            
            result = await file_upload_service.upload_file(
                file_content=data_source.file_content,
                file_name=data_source.file_name,
                user_id=current_user.id,
                organization_id=current_user.organization_id,
                description=data_source.description,
                protected_attributes=data_source.protected_attributes,
                sample_size=data_source.sample_data_size or 100
            )
            
            # Return the created data source
            async with db.begin():
                db_data_source = await db.get(DataSource, result.data_source_id)
                return DataSourceResponse.model_validate(db_data_source)
        
        # For connectors, create from connector config
        else:
            if not data_source.connection_config:
                raise HTTPException(status_code=400, detail="Connection config is required for connectors")
            
            data_source_obj = await connector_service.create_data_source_from_connector(
                connector_type=data_source.source_type,
                config=data_source.connection_config,
                name=data_source.name,
                description=data_source.description,
                user_id=current_user.id,
                organization_id=current_user.organization_id,
                protected_attributes=data_source.protected_attributes
            )
            
            return DataSourceResponse.model_validate(data_source_obj)
            
    except Exception as e:
        logger.error("Failed to create data source", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data-sources", response_model=List[DataSourceResponse])
async def get_data_sources(
    skip: int = 0,
    limit: int = 100,
    source_type: Optional[DataSourceType] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get data sources for the current user."""
    try:
        from sqlalchemy import select
        
        query = select(DataSource).where(
            DataSource.organization_id == current_user.organization_id
        )
        
        if source_type:
            query = query.where(DataSource.source_type == source_type)
        
        query = query.offset(skip).limit(limit).order_by(DataSource.created_at.desc())
        
        result = await db.execute(query)
        data_sources = result.scalars().all()
        
        return [DataSourceResponse.model_validate(ds) for ds in data_sources]
        
    except Exception as e:
        logger.error("Failed to get data sources", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data-sources/{data_source_id}", response_model=DataSourceResponse)
async def get_data_source(
    data_source_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific data source."""
    try:
        data_source = await db.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        if data_source.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return DataSourceResponse.model_validate(data_source)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get data source", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/data-sources/{data_source_id}", response_model=DataSourceResponse)
async def update_data_source(
    data_source_id: uuid.UUID,
    data_source_update: DataSourceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a data source."""
    try:
        data_source = await db.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        if data_source.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Update fields
        for field, value in data_source_update.dict(exclude_unset=True).items():
            setattr(data_source, field, value)
        
        await db.commit()
        await db.refresh(data_source)
        
        return DataSourceResponse.model_validate(data_source)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update data source", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/data-sources/{data_source_id}")
async def delete_data_source(
    data_source_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a data source."""
    try:
        data_source = await db.get(DataSource, data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        if data_source.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        await db.delete(data_source)
        await db.commit()
        
        return {"message": "Data source deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete data source", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

# File upload endpoints
@router.post("/upload-file", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    protected_attributes: Optional[str] = Form(None),
    sample_size: int = Form(100),
    current_user: User = Depends(get_current_active_user)
):
    """Upload a data file."""
    try:
        # Read file content
        file_content = await file.read()
        file_content_base64 = file_content.hex()
        
        # Parse protected attributes
        protected_attrs = []
        if protected_attributes:
            protected_attrs = [attr.strip() for attr in protected_attributes.split(',')]
        
        # Validate file format
        if not await file_upload_service.validate_file_format(file.filename, file_content_base64):
            raise HTTPException(status_code=400, detail="Invalid file format")
        
        result = await file_upload_service.upload_file(
            file_content=file_content_base64,
            file_name=file.filename,
            user_id=current_user.id,
            organization_id=current_user.organization_id,
            description=description,
            protected_attributes=protected_attrs,
            sample_size=sample_size
        )
        
        return result
        
    except Exception as e:
        logger.error("Failed to upload file", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Connector endpoints
@router.post("/test-connector", response_model=ConnectorTestResponse)
async def test_connector(
    connector_type: DataSourceType,
    config: dict,
    current_user: User = Depends(get_current_active_user)
):
    """Test a connector configuration."""
    try:
        result = await connector_service.test_connector(connector_type, config)
        return result
        
    except Exception as e:
        logger.error("Failed to test connector", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/connector-types")
async def get_connector_types(current_user: User = Depends(get_current_active_user)):
    """Get supported connector types."""
    try:
        return {"types": await connector_service.get_supported_connector_types()}
        
    except Exception as e:
        logger.error("Failed to get connector types", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/connector-config/{connector_type}")
async def get_connector_config_schema(
    connector_type: DataSourceType,
    current_user: User = Depends(get_current_active_user)
):
    """Get configuration schema for a connector type."""
    try:
        schema = await connector_service.get_connector_config_schema(connector_type)
        return {"schema": schema}
        
    except Exception as e:
        logger.error("Failed to get connector config schema", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Schema mapping endpoints
@router.post("/schema-mappings", response_model=SchemaMappingResponse)
async def create_schema_mapping(
    mapping: SchemaMappingCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create a new schema mapping."""
    try:
        result = await schema_mapping_service.create_schema_mapping(
            mapping_data=mapping,
            user_id=current_user.id,
            organization_id=current_user.organization_id
        )
        return result
        
    except Exception as e:
        logger.error("Failed to create schema mapping", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/schema-mappings", response_model=List[SchemaMappingResponse])
async def get_schema_mappings(
    data_source_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get schema mappings."""
    try:
        result = await schema_mapping_service.get_schema_mappings(
            data_source_id=data_source_id,
            user_id=current_user.id,
            organization_id=current_user.organization_id
        )
        return result
        
    except Exception as e:
        logger.error("Failed to get schema mappings", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/schema-mappings/{mapping_id}", response_model=SchemaMappingResponse)
async def update_schema_mapping(
    mapping_id: uuid.UUID,
    mapping_update: SchemaMappingUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """Update a schema mapping."""
    try:
        result = await schema_mapping_service.update_schema_mapping(
            mapping_id=mapping_id,
            update_data=mapping_update,
            user_id=current_user.id
        )
        return result
        
    except Exception as e:
        logger.error("Failed to update schema mapping", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/data-preview")
async def get_data_preview(
    request: DataPreviewRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Get data preview with optional schema mapping."""
    try:
        result = await schema_mapping_service.get_data_preview(
            request=request,
            user_id=current_user.id
        )
        return {"data": result}
        
    except Exception as e:
        logger.error("Failed to get data preview", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-mappings")
async def suggest_mappings(
    data_source_id: uuid.UUID,
    target_schema: dict,
    current_user: User = Depends(get_current_active_user)
):
    """Suggest column mappings based on source and target schemas."""
    try:
        result = await schema_mapping_service.suggest_mappings(
            data_source_id=data_source_id,
            target_schema=target_schema
        )
        return result
        
    except Exception as e:
        logger.error("Failed to suggest mappings", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Data validation endpoints
@router.post("/validations", response_model=DataValidationResponse)
async def create_validation(
    validation: DataValidationCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create a new data validation."""
    try:
        result = await data_validation_service.create_validation(
            validation_data=validation,
            user_id=current_user.id,
            organization_id=current_user.organization_id
        )
        return result
        
    except Exception as e:
        logger.error("Failed to create validation", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/validations", response_model=List[DataValidationResponse])
async def get_validations(
    data_source_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get data validations."""
    try:
        result = await data_validation_service.get_validations(
            data_source_id=data_source_id,
            user_id=current_user.id,
            organization_id=current_user.organization_id
        )
        return result
        
    except Exception as e:
        logger.error("Failed to get validations", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/validations/summary/{data_source_id}", response_model=ValidationSummary)
async def get_validation_summary(
    data_source_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user)
):
    """Get validation summary for a data source."""
    try:
        result = await data_validation_service.get_validation_summary(data_source_id)
        return result
        
    except Exception as e:
        logger.error("Failed to get validation summary", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/validation-templates")
async def get_validation_templates(current_user: User = Depends(get_current_active_user)):
    """Get predefined validation rule templates."""
    try:
        templates = await data_validation_service.get_validation_templates()
        return {"templates": templates}
        
    except Exception as e:
        logger.error("Failed to get validation templates", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest-validation-rules")
async def suggest_validation_rules(
    data_source_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user)
):
    """Suggest validation rules based on data schema."""
    try:
        suggestions = await data_validation_service.suggest_validation_rules(data_source_id)
        return {"suggestions": suggestions}
        
    except Exception as e:
        logger.error("Failed to suggest validation rules", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Schema inference endpoints
@router.post("/infer-schema", response_model=SchemaInferenceResponse)
async def infer_schema(
    request: SchemaInferenceRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Infer schema from data source."""
    try:
        # Get data source
        data_source = await db.get(DataSource, request.data_source_id)
        if not data_source:
            raise HTTPException(status_code=404, detail="Data source not found")
        
        if data_source.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get sample data
        sample_data = await file_upload_service.get_data_preview(
            data_source_id=request.data_source_id,
            limit=request.sample_size
        )
        
        if not sample_data:
            raise HTTPException(status_code=400, detail="No data available for schema inference")
        
        # Infer schema using pandas
        import pandas as pd
        df = pd.DataFrame(sample_data)
        
        inferred_schema = {
            "columns": [],
            "data_types": {},
            "sample_stats": {},
            "nullable_columns": [],
            "unique_counts": {}
        }
        
        for column in df.columns:
            col_data = df[column]
            dtype = str(col_data.dtype)
            
            inferred_schema["columns"].append({
                "name": column,
                "data_type": dtype,
                "nullable": col_data.isnull().any()
            })
            
            inferred_schema["data_types"][column] = dtype
            
            # Generate sample statistics
            if dtype in ['int64', 'float64']:
                inferred_schema["sample_stats"][column] = {
                    "mean": float(col_data.mean()) if not col_data.empty else None,
                    "std": float(col_data.std()) if not col_data.empty else None,
                    "min": float(col_data.min()) if not col_data.empty else None,
                    "max": float(col_data.max()) if not col_data.empty else None
                }
            elif dtype == 'object':
                inferred_schema["sample_stats"][column] = {
                    "avg_length": float(col_data.astype(str).str.len().mean()),
                    "max_length": int(col_data.astype(str).str.len().max()),
                    "unique_values": int(col_data.nunique())
                }
            
            inferred_schema["nullable_columns"].append(column) if col_data.isnull().any() else None
            inferred_schema["unique_counts"][column] = int(col_data.nunique())
        
        return SchemaInferenceResponse(
            columns=inferred_schema["columns"],
            data_types=inferred_schema["data_types"],
            sample_stats=inferred_schema["sample_stats"],
            inferred_schema=inferred_schema,
            confidence_scores={col: 0.9 for col in df.columns}  # Placeholder
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to infer schema", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Protected attribute endpoints
@router.post("/protected-attributes", response_model=ProtectedAttributeConfigResponse)
async def create_protected_attribute_config(
    config: ProtectedAttributeConfigCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a protected attribute configuration."""
    try:
        from app.models.data_source import ProtectedAttributeConfig
        
        protected_config = ProtectedAttributeConfig(
            name=config.name,
            description=config.description,
            attribute_name=config.attribute_name,
            attribute_type=config.attribute_type,
            sensitive_values=config.sensitive_values,
            masking_rules=config.masking_rules,
            bias_threshold=config.bias_threshold,
            fairness_metrics=config.fairness_metrics,
            reporting_config=config.reporting_config,
            compliance_frameworks=config.compliance_frameworks,
            retention_policy=config.retention_policy,
            is_sensitive=config.is_sensitive,
            created_by=current_user.id,
            organization_id=current_user.organization_id
        )
        
        db.add(protected_config)
        await db.commit()
        await db.refresh(protected_config)
        
        return ProtectedAttributeConfigResponse.model_validate(protected_config)
        
    except Exception as e:
        logger.error("Failed to create protected attribute config", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/protected-attributes", response_model=List[ProtectedAttributeConfigResponse])
async def get_protected_attribute_configs(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get protected attribute configurations."""
    try:
        from app.models.data_source import ProtectedAttributeConfig
        from sqlalchemy import select
        
        query = select(ProtectedAttributeConfig).where(
            ProtectedAttributeConfig.organization_id == current_user.organization_id
        )
        
        result = await db.execute(query)
        configs = result.scalars().all()
        
        return [ProtectedAttributeConfigResponse.model_validate(config) for config in configs]
        
    except Exception as e:
        logger.error("Failed to get protected attribute configs", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Utility endpoints
@router.get("/supported-file-types")
async def get_supported_file_types(current_user: User = Depends(get_current_active_user)):
    """Get supported file types for upload."""
    try:
        file_types = await file_upload_service.get_supported_file_types()
        return {"file_types": file_types}
        
    except Exception as e:
        logger.error("Failed to get supported file types", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/file-size-limit")
async def get_file_size_limit(current_user: User = Depends(get_current_active_user)):
    """Get maximum file size limit."""
    try:
        limit = await file_upload_service.get_file_size_limit()
        return {"limit_bytes": limit, "limit_mb": limit / (1024 * 1024)}
        
    except Exception as e:
        logger.error("Failed to get file size limit", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Model file upload endpoints
@router.post("/upload-model")
async def upload_model_file(
    file: UploadFile = File(...),
    model_id: Optional[uuid.UUID] = Form(None),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user)
):
    """Upload a model file (pickle/ONNX)."""
    try:
        # Read file content
        file_content = await file.read()
        file_content_base64 = file_content.hex()
        
        result = await file_upload_service.upload_model_file(
            file_content=file_content_base64,
            file_name=file.filename,
            user_id=current_user.id,
            organization_id=current_user.organization_id,
            model_id=model_id,
            description=description
        )
        
        return result
        
    except Exception as e:
        logger.error("Failed to upload model file", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/supported-model-types")
async def get_supported_model_file_types(current_user: User = Depends(get_current_active_user)):
    """Get supported model file types."""
    try:
        model_types = await file_upload_service.get_supported_model_file_types()
        return {"model_types": model_types}
        
    except Exception as e:
        logger.error("Failed to get supported model types", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model-file-size-limit")
async def get_model_file_size_limit(current_user: User = Depends(get_current_active_user)):
    """Get maximum model file size limit."""
    try:
        from app.core.config import settings
        return {"limit_bytes": settings.MAX_MODEL_FILE_SIZE, "limit_mb": settings.MAX_MODEL_FILE_SIZE / (1024 * 1024)}
        
    except Exception as e:
        logger.error("Failed to get model file size limit", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))