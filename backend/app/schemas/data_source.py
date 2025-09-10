from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum
import uuid

class DataSourceType(str, Enum):
    FILE_UPLOAD = "file_upload"
    S3_CONNECTOR = "s3_connector"
    AZURE_BLOB_CONNECTOR = "azure_blob_connector"
    SHAREPOINT_CONNECTOR = "sharepoint_connector"
    API_CONNECTOR = "api_connector"

class DataSourceStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PROCESSING = "processing"

class DataType(str, Enum):
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    DATETIME = "datetime"
    CATEGORICAL = "categorical"
    NUMERICAL = "numerical"
    TEXT = "text"
    BINARY = "binary"

# Base schemas
class DataSourceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    source_type: DataSourceType
    protected_attributes: Optional[List[str]] = []
    protected_attribute_config: Optional[Dict[str, Any]] = {}

class DataSourceCreate(DataSourceBase):
    file_content: Optional[str] = None  # Base64 encoded file content
    file_name: Optional[str] = None
    connection_config: Optional[Dict[str, Any]] = None
    sample_data_size: Optional[int] = Field(default=100, ge=1, le=10000)

class DataSourceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[DataSourceStatus] = None
    protected_attributes: Optional[List[str]] = None
    protected_attribute_config: Optional[Dict[str, Any]] = None

class DataSourceResponse(DataSourceBase):
    id: uuid.UUID
    status: DataSourceStatus
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    content_type: Optional[str] = None
    connection_config: Optional[Dict[str, Any]] = None
    connector_metadata: Optional[Dict[str, Any]] = None
    schema_info: Optional[Dict[str, Any]] = None
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    validation_results: Optional[Dict[str, Any]] = None
    quality_metrics: Optional[Dict[str, Any]] = None
    sample_data: Optional[List[Dict[str, Any]]] = None
    is_processed: bool
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    created_by: uuid.UUID
    organization_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_accessed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schema Mapping schemas
class SchemaMappingBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    column_mappings: Dict[str, str] = {}  # source_column -> target_column
    data_type_mappings: Dict[str, str] = {}  # source_column -> target_data_type
    transformation_rules: Dict[str, Any] = {}
    protected_attribute_mappings: Dict[str, Any] = {}

class SchemaMappingCreate(SchemaMappingBase):
    data_source_id: uuid.UUID
    target_schema: Optional[Dict[str, Any]] = None

class SchemaMappingUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    column_mappings: Optional[Dict[str, str]] = None
    data_type_mappings: Optional[Dict[str, str]] = None
    transformation_rules: Optional[Dict[str, Any]] = None
    protected_attribute_mappings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None

class SchemaMappingResponse(SchemaMappingBase):
    id: uuid.UUID
    data_source_id: uuid.UUID
    target_schema: Optional[Dict[str, Any]] = None
    target_columns: Optional[Dict[str, Any]] = None
    mapping_validation: Optional[Dict[str, Any]] = None
    preview_data: Optional[List[Dict[str, Any]]] = None
    is_active: bool
    is_default: bool
    usage_count: int
    created_by: uuid.UUID
    organization_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_used_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Data Validation schemas
class ValidationRule(BaseModel):
    column_name: str
    rule_type: str  # not_null, unique, range, regex, custom
    condition: Optional[str] = None
    parameters: Dict[str, Any] = {}

class DataValidationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    validation_rules: List[ValidationRule] = []
    validation_type: str = "schema"  # schema, data_quality, business_rules
    sample_size: Optional[int] = Field(default=1000, ge=1, le=100000)

class DataValidationCreate(DataValidationBase):
    data_source_id: uuid.UUID
    schema_mapping_id: Optional[uuid.UUID] = None

class DataValidationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    validation_rules: Optional[List[ValidationRule]] = None
    validation_type: Optional[str] = None
    sample_size: Optional[int] = Field(None, ge=1, le=100000)

class DataValidationResponse(DataValidationBase):
    id: uuid.UUID
    data_source_id: uuid.UUID
    schema_mapping_id: Optional[uuid.UUID] = None
    is_valid: bool
    validation_results: Optional[Dict[str, Any]] = None
    error_summary: Optional[Dict[str, Any]] = None
    warnings: Optional[List[str]] = None
    total_records: Optional[int] = None
    valid_records: Optional[int] = None
    invalid_records: Optional[int] = None
    validation_score: Optional[float] = None
    execution_time: Optional[float] = None
    memory_usage: Optional[float] = None
    status: str
    created_by: uuid.UUID
    organization_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Protected Attribute Config schemas
class ProtectedAttributeConfigBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    attribute_name: str
    attribute_type: str
    sensitive_values: Optional[List[str]] = []
    masking_rules: Optional[Dict[str, Any]] = {}
    bias_threshold: float = Field(default=0.8, ge=0.0, le=1.0)
    fairness_metrics: Optional[Dict[str, Any]] = {}
    reporting_config: Optional[Dict[str, Any]] = {}
    compliance_frameworks: Optional[List[str]] = []
    retention_policy: Optional[str] = None
    is_sensitive: bool = False

class ProtectedAttributeConfigCreate(ProtectedAttributeConfigBase):
    pass

class ProtectedAttributeConfigUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    attribute_name: Optional[str] = None
    attribute_type: Optional[str] = None
    sensitive_values: Optional[List[str]] = None
    masking_rules: Optional[Dict[str, Any]] = None
    bias_threshold: Optional[float] = Field(None, ge=0.0, le=1.0)
    fairness_metrics: Optional[Dict[str, Any]] = None
    reporting_config: Optional[Dict[str, Any]] = None
    compliance_frameworks: Optional[List[str]] = None
    retention_policy: Optional[str] = None
    is_active: Optional[bool] = None
    is_sensitive: Optional[bool] = None

class ProtectedAttributeConfigResponse(ProtectedAttributeConfigBase):
    id: uuid.UUID
    is_active: bool
    created_by: uuid.UUID
    organization_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Data preview and schema inference schemas
class DataPreviewRequest(BaseModel):
    data_source_id: uuid.UUID
    limit: Optional[int] = Field(default=100, ge=1, le=1000)
    offset: Optional[int] = Field(default=0, ge=0)
    schema_mapping_id: Optional[uuid.UUID] = None

class SchemaInferenceRequest(BaseModel):
    data_source_id: uuid.UUID
    sample_size: Optional[int] = Field(default=1000, ge=100, le=10000)

class SchemaInferenceResponse(BaseModel):
    columns: List[Dict[str, Any]]
    data_types: Dict[str, str]
    sample_stats: Dict[str, Any]
    inferred_schema: Dict[str, Any]
    confidence_scores: Dict[str, float]

# Connector configuration schemas
class S3ConnectorConfig(BaseModel):
    bucket_name: str
    access_key: str
    secret_key: str
    region: str
    endpoint_url: Optional[str] = None
    file_path: Optional[str] = None
    file_pattern: Optional[str] = None

class AzureBlobConfig(BaseModel):
    connection_string: str
    container_name: str
    file_path: Optional[str] = None
    file_pattern: Optional[str] = None

class SharePointConfig(BaseModel):
    site_url: str
    client_id: str
    client_secret: str
    tenant_id: str
    file_path: Optional[str] = None
    file_pattern: Optional[str] = None

# Response schemas for API endpoints
class FileUploadResponse(BaseModel):
    message: str
    data_source_id: uuid.UUID
    file_name: str
    file_size: int
    file_type: str
    preview_data: Optional[List[Dict[str, Any]]] = None
    inferred_schema: Optional[Dict[str, Any]] = None

class ConnectorTestResponse(BaseModel):
    success: bool
    message: str
    connection_info: Optional[Dict[str, Any]] = None
    available_files: Optional[List[str]] = None

class ValidationSummary(BaseModel):
    total_rules: int
    passed_rules: int
    failed_rules: int
    total_records: int
    valid_records: int
    invalid_records: int
    validation_score: float
    critical_issues: List[str]
    warnings: List[str]