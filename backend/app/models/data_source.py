from sqlalchemy import Column, String, Text, DateTime, Boolean, JSON, UUID, ForeignKey, Integer, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum

class DataSourceType(str, enum.Enum):
    FILE_UPLOAD = "file_upload"
    S3_CONNECTOR = "s3_connector"
    AZURE_BLOB_CONNECTOR = "azure_blob_connector"
    SHAREPOINT_CONNECTOR = "sharepoint_connector"
    API_CONNECTOR = "api_connector"

class DataSourceStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PROCESSING = "processing"

class DataType(str, enum.Enum):
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    DATETIME = "datetime"
    CATEGORICAL = "categorical"
    NUMERICAL = "numerical"
    TEXT = "text"
    BINARY = "binary"

class DataSource(Base):
    __tablename__ = "data_sources"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Source configuration
    source_type = Column(Enum(DataSourceType), nullable=False)
    status = Column(Enum(DataSourceStatus), nullable=False, default=DataSourceStatus.ACTIVE)
    
    # File upload specific
    file_path = Column(String(500))  # Path in MinIO
    file_name = Column(String(255))
    file_size = Column(Integer)  # in bytes
    file_type = Column(String(50))  # csv, parquet, etc.
    content_type = Column(String(100))
    
    # Connector specific
    connection_config = Column(JSON)  # Connection details for external sources
    connector_metadata = Column(JSON)  # Additional metadata from connectors
    
    # Schema information
    schema_info = Column(JSON)  # Column definitions, types, etc.
    row_count = Column(Integer)
    column_count = Column(Integer)
    
    # Protected attributes configuration
    protected_attributes = Column(JSON)  # List of protected attribute columns
    protected_attribute_config = Column(JSON)  # Configuration for protected attributes
    
    # Validation and quality
    validation_results = Column(JSON)  # Data validation results
    quality_metrics = Column(JSON)  # Data quality metrics
    sample_data = Column(JSON)  # Sample data for preview
    
    # Processing information
    is_processed = Column(Boolean, default=False)
    processing_started_at = Column(DateTime(timezone=True))
    processing_completed_at = Column(DateTime(timezone=True))
    
    # User and organization
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    last_accessed_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", backref="data_sources")
    organization = relationship("Organization", backref="data_sources")
    schema_mappings = relationship("SchemaMapping", back_populates="data_source", cascade="all, delete-orphan")
    data_validations = relationship("DataValidation", back_populates="data_source", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<DataSource(id={self.id}, name={self.name}, type={self.source_type})>"

class SchemaMapping(Base):
    __tablename__ = "schema_mappings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Foreign keys
    data_source_id = Column(UUID(as_uuid=True), ForeignKey("data_sources.id"), nullable=False)
    
    # Mapping configuration
    column_mappings = Column(JSON)  # Map source columns to target columns
    data_type_mappings = Column(JSON)  # Map source data types to target data types
    transformation_rules = Column(JSON)  # Data transformation rules
    
    # Protected attributes mapping
    protected_attribute_mappings = Column(JSON)  # How protected attributes are mapped
    
    # Target schema information
    target_schema = Column(JSON)  # Target schema definition
    target_columns = Column(JSON)  # Target column definitions
    
    # Validation and preview
    mapping_validation = Column(JSON)  # Validation results for the mapping
    preview_data = Column(JSON)  # Preview of mapped data
    
    # Status and usage
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)
    
    # User and organization
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    last_used_at = Column(DateTime(timezone=True))
    
    # Relationships
    data_source = relationship("DataSource", back_populates="schema_mappings")
    user = relationship("User", backref="schema_mappings")
    organization = relationship("Organization", backref="schema_mappings")
    
    def __repr__(self):
        return f"<SchemaMapping(id={self.id}, name={self.name}, data_source_id={self.data_source_id})>"

class DataValidation(Base):
    __tablename__ = "data_validations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    
    # Foreign keys
    data_source_id = Column(UUID(as_uuid=True), ForeignKey("data_sources.id"), nullable=False)
    schema_mapping_id = Column(UUID(as_uuid=True), ForeignKey("schema_mappings.id"), nullable=True)
    
    # Validation configuration
    validation_rules = Column(JSON)  # Validation rules to apply
    validation_type = Column(String(100))  # Type of validation (schema, data_quality, etc.)
    
    # Validation results
    is_valid = Column(Boolean, nullable=False)
    validation_results = Column(JSON)  # Detailed validation results
    error_summary = Column(JSON)  # Summary of errors found
    warnings = Column(JSON)  # Validation warnings
    
    # Metrics
    total_records = Column(Integer)
    valid_records = Column(Integer)
    invalid_records = Column(Integer)
    validation_score = Column(Float)  # 0.0 to 1.0
    
    # Performance metrics
    execution_time = Column(Float)  # in seconds
    memory_usage = Column(Float)  # in MB
    
    # Status and configuration
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    sample_size = Column(Integer, default=1000)  # Number of records sampled for validation
    
    # User and organization
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Relationships
    data_source = relationship("DataSource", back_populates="data_validations")
    user = relationship("User", backref="data_validations")
    organization = relationship("Organization", backref="data_validations")
    
    def __repr__(self):
        return f"<DataValidation(id={self.id}, name={self.name}, is_valid={self.is_valid})>"

class ProtectedAttributeConfig(Base):
    __tablename__ = "protected_attribute_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Configuration details
    attribute_name = Column(String(255), nullable=False)  # Column name
    attribute_type = Column(String(100))  # Type of protected attribute
    sensitive_values = Column(JSON)  # List of sensitive values or patterns
    masking_rules = Column(JSON)  # Rules for masking or anonymizing
    
    # Bias detection configuration
    bias_threshold = Column(Float, default=0.8)  # Threshold for bias detection
    fairness_metrics = Column(JSON)  # Fairness metrics to track
    reporting_config = Column(JSON)  # How to report on this attribute
    
    # Compliance information
    compliance_frameworks = Column(JSON)  # Associated compliance frameworks
    retention_policy = Column(String(100))  # How long to keep data
    
    # Status
    is_active = Column(Boolean, default=True)
    is_sensitive = Column(Boolean, default=False)
    
    # User and organization
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    
    # Relationships
    user = relationship("User", backref="protected_attribute_configs")
    organization = relationship("Organization", backref="protected_attribute_configs")
    
    def __repr__(self):
        return f"<ProtectedAttributeConfig(id={self.id}, name={self.name}, attribute_name={self.attribute_name})>"