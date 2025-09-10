import pandas as pd
import structlog
from typing import Optional, List, Dict, Any, Tuple
import uuid
import json
from datetime import datetime
import numpy as np

from app.models.data_source import DataSource, SchemaMapping, DataType
from app.schemas.data_source import (
    SchemaMappingCreate, SchemaMappingUpdate, SchemaMappingResponse,
    DataPreviewRequest, DataValidation, ValidationRule, DataValidationCreate
)
from app.core.database import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

logger = structlog.get_logger()

class SchemaMappingService:
    """Service for managing schema mappings and data transformations."""
    
    def __init__(self):
        self.data_type_mappings = {
            # From pandas/SQL types to our DataType enum
            "int64": DataType.INTEGER,
            "int32": DataType.INTEGER,
            "float64": DataType.FLOAT,
            "float32": DataType.FLOAT,
            "bool": DataType.BOOLEAN,
            "object": DataType.STRING,
            "datetime64[ns]": DataType.DATETIME,
            "category": DataType.CATEGORICAL,
            "string": DataType.STRING,
            "text": DataType.TEXT
        }
    
    async def create_schema_mapping(
        self, 
        mapping_data: SchemaMappingCreate, 
        user_id: uuid.UUID, 
        organization_id: uuid.UUID
    ) -> SchemaMappingResponse:
        """Create a new schema mapping."""
        try:
            async with AsyncSessionLocal() as session:
                # Get data source
                data_source = await session.get(DataSource, mapping_data.data_source_id)
                if not data_source:
                    raise ValueError(f"Data source not found: {mapping_data.data_source_id}")
                
                # Validate mapping
                validation_result = await self._validate_mapping(
                    mapping_data.column_mappings, 
                    mapping_data.data_type_mappings,
                    data_source.schema_info
                )
                
                # Create mapping
                schema_mapping = SchemaMapping(
                    name=mapping_data.name,
                    description=mapping_data.description,
                    data_source_id=mapping_data.data_source_id,
                    column_mappings=mapping_data.column_mappings,
                    data_type_mappings=mapping_data.data_type_mappings,
                    transformation_rules=mapping_data.transformation_rules,
                    protected_attribute_mappings=mapping_data.protected_attribute_mappings,
                    target_schema=mapping_data.target_schema,
                    mapping_validation=validation_result,
                    created_by=user_id,
                    organization_id=organization_id
                )
                
                session.add(schema_mapping)
                await session.commit()
                await session.refresh(schema_mapping)
                
                logger.info(f"Created schema mapping: {mapping_data.name}", mapping_id=str(schema_mapping.id))
                return SchemaMappingResponse.model_validate(schema_mapping)
                
        except Exception as e:
            logger.error(f"Failed to create schema mapping: {e}")
            raise
    
    async def update_schema_mapping(
        self, 
        mapping_id: uuid.UUID, 
        update_data: SchemaMappingUpdate,
        user_id: uuid.UUID
    ) -> SchemaMappingResponse:
        """Update an existing schema mapping."""
        try:
            async with AsyncSessionLocal() as session:
                mapping = await session.get(SchemaMapping, mapping_id)
                if not mapping:
                    raise ValueError(f"Schema mapping not found: {mapping_id}")
                
                # Update fields
                for field, value in update_data.dict(exclude_unset=True).items():
                    setattr(mapping, field, value)
                
                # Re-validate mapping if it was changed
                if update_data.column_mappings or update_data.data_type_mappings:
                    data_source = await session.get(DataSource, mapping.data_source_id)
                    validation_result = await self._validate_mapping(
                        mapping.column_mappings, 
                        mapping.data_type_mappings,
                        data_source.schema_info
                    )
                    mapping.mapping_validation = validation_result
                
                await session.commit()
                await session.refresh(mapping)
                
                logger.info(f"Updated schema mapping: {mapping_id}")
                return SchemaMappingResponse.model_validate(mapping)
                
        except Exception as e:
            logger.error(f"Failed to update schema mapping: {e}")
            raise
    
    async def get_schema_mappings(
        self, 
        data_source_id: Optional[uuid.UUID] = None,
        user_id: Optional[uuid.UUID] = None,
        organization_id: Optional[uuid.UUID] = None
    ) -> List[SchemaMappingResponse]:
        """Get schema mappings with optional filters."""
        try:
            async with AsyncSessionLocal() as session:
                query = select(SchemaMapping)
                
                if data_source_id:
                    query = query.where(SchemaMapping.data_source_id == data_source_id)
                if user_id:
                    query = query.where(SchemaMapping.created_by == user_id)
                if organization_id:
                    query = query.where(SchemaMapping.organization_id == organization_id)
                
                result = await session.execute(query)
                mappings = result.scalars().all()
                
                return [SchemaMappingResponse.model_validate(mapping) for mapping in mappings]
                
        except Exception as e:
            logger.error(f"Failed to get schema mappings: {e}")
            raise
    
    async def get_data_preview(
        self, 
        request: DataPreviewRequest,
        user_id: uuid.UUID
    ) -> List[Dict[str, Any]]:
        """Get data preview with optional schema mapping applied."""
        try:
            async with AsyncSessionLocal() as session:
                # Get data source
                data_source = await session.get(DataSource, request.data_source_id)
                if not data_source:
                    raise ValueError(f"Data source not found: {request.data_source_id}")
                
                # Get sample data
                if data_source.sample_data:
                    sample_data = data_source.sample_data
                else:
                    # Read from file
                    from app.services.minio_service import MinioService
                    minio_service = MinioService()
                    file_content = minio_service.download_file_content(
                        data_source.file_path.split('/')[-1]
                    )
                    
                    # Read file based on type
                    if data_source.file_type == 'csv':
                        df = pd.read_csv(pd.io.common.BytesIO(file_content))
                    elif data_source.file_type == 'parquet':
                        df = pd.read_parquet(pd.io.common.BytesIO(file_content))
                    else:
                        raise ValueError(f"Unsupported file type: {data_source.file_type}")
                    
                    sample_data = df.head(request.limit + request.offset).to_dict('records')
                
                # Apply schema mapping if provided
                if request.schema_mapping_id:
                    mapping = await session.get(SchemaMapping, request.schema_mapping_id)
                    if mapping:
                        sample_data = await self._apply_mapping(
                            sample_data, 
                            mapping.column_mappings,
                            mapping.transformation_rules
                        )
                
                return sample_data[request.offset:request.offset + request.limit]
                
        except Exception as e:
            logger.error(f"Failed to get data preview: {e}")
            raise
    
    async def _validate_mapping(
        self, 
        column_mappings: Dict[str, str], 
        data_type_mappings: Dict[str, str],
        schema_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate schema mapping against source schema."""
        try:
            validation_result = {
                "is_valid": True,
                "errors": [],
                "warnings": [],
                "suggestions": []
            }
            
            if not schema_info or "columns" not in schema_info:
                validation_result["is_valid"] = False
                validation_result["errors"].append("Source schema information not available")
                return validation_result
            
            source_columns = {col["name"] for col in schema_info["columns"]}
            mapped_columns = set(column_mappings.keys())
            
            # Check for unmapped source columns
            unmapped_columns = source_columns - mapped_columns
            if unmapped_columns:
                validation_result["warnings"].append(f"Unmapped source columns: {', '.join(unmapped_columns)}")
            
            # Check for invalid source column references
            invalid_columns = mapped_columns - source_columns
            if invalid_columns:
                validation_result["is_valid"] = False
                validation_result["errors"].append(f"Invalid source column references: {', '.join(invalid_columns)}")
            
            # Validate data type mappings
            for column, target_type in data_type_mappings.items():
                if column not in source_columns:
                    validation_result["is_valid"] = False
                    validation_result["errors"].append(f"Invalid column in data type mapping: {column}")
                    continue
                
                # Check if data type conversion is valid
                source_column_info = next(
                    (col for col in schema_info["columns"] if col["name"] == column), 
                    None
                )
                
                if source_column_info:
                    source_type = source_column_info["data_type"]
                    if not await self._is_valid_type_conversion(source_type, target_type):
                        validation_result["warnings"].append(
                            f"Potential data loss converting {column} from {source_type} to {target_type}"
                        )
            
            return validation_result
            
        except Exception as e:
            logger.error(f"Failed to validate mapping: {e}")
            return {
                "is_valid": False,
                "errors": [f"Validation error: {str(e)}"],
                "warnings": [],
                "suggestions": []
            }
    
    async def _is_valid_type_conversion(self, source_type: str, target_type: str) -> bool:
        """Check if data type conversion is valid."""
        # Define valid conversion paths
        valid_conversions = {
            "string": ["string", "text", "categorical"],
            "integer": ["integer", "float", "string", "text"],
            "float": ["float", "string", "text"],
            "boolean": ["boolean", "string", "text", "integer"],
            "datetime": ["datetime", "string", "text"],
            "categorical": ["categorical", "string", "text", "integer"],
            "text": ["text", "string"],
            "numerical": ["numerical", "integer", "float", "string", "text"]
        }
        
        return target_type in valid_conversions.get(source_type, [])
    
    async def _apply_mapping(
        self, 
        data: List[Dict[str, Any]], 
        column_mappings: Dict[str, str],
        transformation_rules: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Apply schema mapping to data."""
        try:
            mapped_data = []
            
            for row in data:
                mapped_row = {}
                
                # Apply column mappings
                for source_col, target_col in column_mappings.items():
                    if source_col in row:
                        mapped_row[target_col] = row[source_col]
                
                # Apply transformations
                for column, rules in transformation_rules.items():
                    if column in mapped_row:
                        mapped_row[column] = await self._apply_transformation(
                            mapped_row[column], rules
                        )
                
                mapped_data.append(mapped_row)
            
            return mapped_data
            
        except Exception as e:
            logger.error(f"Failed to apply mapping: {e}")
            raise
    
    async def _apply_transformation(self, value: Any, rules: Dict[str, Any]) -> Any:
        """Apply transformation rules to a value."""
        try:
            transformation_type = rules.get("type")
            
            if transformation_type == "uppercase":
                return str(value).upper()
            elif transformation_type == "lowercase":
                return str(value).lower()
            elif transformation_type == "trim":
                return str(value).strip()
            elif transformation_type == "replace":
                old_value = rules.get("old_value")
                new_value = rules.get("new_value")
                return str(value).replace(old_value, new_value)
            elif transformation_type == "format_date":
                date_format = rules.get("format", "%Y-%m-%d")
                if pd.notna(value):
                    return pd.to_datetime(value).strftime(date_format)
                return value
            elif transformation_type == "normalize":
                # Normalize numeric values
                min_val = rules.get("min")
                max_val = rules.get("max")
                if min_val is not None and max_val is not None:
                    return (float(value) - min_val) / (max_val - min_val)
                return value
            elif transformation_type == "bin":
                bins = rules.get("bins", [])
                if bins:
                    return pd.cut([value], bins=bins, labels=False)[0]
                return value
            else:
                return value
                
        except Exception as e:
            logger.error(f"Failed to apply transformation: {e}")
            return value
    
    async def suggest_mappings(
        self, 
        data_source_id: uuid.UUID, 
        target_schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Suggest column mappings based on source and target schemas."""
        try:
            async with AsyncSessionLocal() as session:
                data_source = await session.get(DataSource, data_source_id)
                if not data_source:
                    raise ValueError(f"Data source not found: {data_source_id}")
                
                source_columns = [col["name"] for col in data_source.schema_info.get("columns", [])]
                target_columns = target_schema.get("columns", [])
                
                suggestions = {
                    "column_mappings": {},
                    "data_type_mappings": {},
                    "confidence_scores": {},
                    "warnings": []
                }
                
                # Simple matching based on column names
                for target_col in target_columns:
                    target_name = target_col["name"]
                    target_type = target_col.get("data_type", "string")
                    
                    # Find best match in source columns
                    best_match = None
                    best_score = 0
                    
                    for source_col in source_columns:
                        # Simple string similarity (can be improved with better algorithms)
                        similarity = self._calculate_similarity(source_col.lower(), target_name.lower())
                        if similarity > best_score:
                            best_score = similarity
                            best_match = source_col
                    
                    if best_match and best_score > 0.7:  # Confidence threshold
                        suggestions["column_mappings"][best_match] = target_name
                        suggestions["data_type_mappings"][best_match] = target_type
                        suggestions["confidence_scores"][best_match] = best_score
                    else:
                        suggestions["warnings"].append(f"No good match found for target column: {target_name}")
                
                return suggestions
                
        except Exception as e:
            logger.error(f"Failed to suggest mappings: {e}")
            raise
    
    def _calculate_similarity(self, str1: str, str2: str) -> float:
        """Calculate string similarity score (0-1)."""
        if str1 == str2:
            return 1.0
        
        # Simple implementation - can be improved with Levenshtein distance
        str1_clean = str1.replace("_", "").replace(" ", "")
        str2_clean = str2.replace("_", "").replace(" ", "")
        
        if str1_clean == str2_clean:
            return 0.9
        
        # Check if one is substring of the other
        if str1_clean in str2_clean or str2_clean in str1_clean:
            return 0.8
        
        return 0.0