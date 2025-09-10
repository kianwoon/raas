from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator, AnyHttpUrl
import secrets


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    APP_NAME: str = "RAI Platform API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "RAI Platform"
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str] | str:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Database
    DATABASE_URL: str = "postgresql://raas_user:raas_password@localhost:5432/raas_platform"
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_POOL_SIZE: int = 10
    
    # OIDC/OAuth2
    OIDC_CLIENT_ID: Optional[str] = None
    OIDC_CLIENT_SECRET: Optional[str] = None
    OIDC_AUTHORITY: Optional[str] = None
    OIDC_REDIRECT_URI: Optional[str] = "http://localhost:8000/api/v1/auth/callback"
    
    # File Storage
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "rai-platform"
    MINIO_SECURE: bool = False
    
    # Elasticsearch
    ELASTICSEARCH_URL: str = "http://localhost:9200"
    
    # Email (for notifications)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Security
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "0.0.0.0"]
    
    # File Upload
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_FILE_TYPES: List[str] = ["pdf", "doc", "docx", "txt", "csv", "json", "png", "jpg", "jpeg", "parquet", "pkl", "pickle", "onnx"]
    MAX_MODEL_FILE_SIZE: int = 500 * 1024 * 1024  # 500MB for model files
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # Assessment
    ASSESSMENT_TIMEOUT_MINUTES: int = 60
    DIAGNOSTICS_TIMEOUT_MINUTES: int = 30
    
    # Audit
    AUDIT_LOG_RETENTION_DAYS: int = 2555  # 7 years
    EVIDENCE_RETENTION_DAYS: int = 2555  # 7 years
    
    @validator("EMAILS_FROM_NAME")
    def get_project_name(cls, v: Optional[str], values: dict) -> str:
        if not v:
            return values["PROJECT_NAME"]
        return v
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        return [str(origin) for origin in self.BACKEND_CORS_ORIGINS]
    
    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """Get async database URL."""
        return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()