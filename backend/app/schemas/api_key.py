from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

from app.models.api_key import ApiKeyEnvironment, ApiKeyPermission, ApiKeyAction


class ApiKeyCreate(BaseModel):
    """Schema for creating an API key."""
    name: str = Field(..., min_length=1, max_length=255, description="Name of the API key")
    environment: ApiKeyEnvironment = Field(default=ApiKeyEnvironment.development, description="Environment type")
    permissions: List[str] = Field(default=["read"], description="List of permissions")
    rate_limit: int = Field(default=1000, gt=0, le=1000000, description="Monthly rate limit")
    ip_whitelist: Optional[List[str]] = Field(default=None, description="IP whitelist for access control")
    description: Optional[str] = Field(default=None, max_length=1000, description="Description of the API key")
    expires_at: Optional[datetime] = Field(default=None, description="Expiration date")

    @validator('permissions')
    def validate_permissions(cls, v):
        """Validate permissions against allowed values."""
        allowed_permissions = [p.value for p in ApiKeyPermission]
        for perm in v:
            if perm not in allowed_permissions:
                raise ValueError(f"Invalid permission: {perm}. Allowed: {allowed_permissions}")
        return v


class ApiKeyUpdate(BaseModel):
    """Schema for updating an API key."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    permissions: Optional[List[str]] = Field(None)
    rate_limit: Optional[int] = Field(None, gt=0, le=1000000)
    ip_whitelist: Optional[List[str]] = Field(None)
    description: Optional[str] = Field(None, max_length=1000)
    expires_at: Optional[datetime] = Field(None)

    @validator('permissions')
    def validate_permissions(cls, v):
        """Validate permissions against allowed values."""
        if v is None:
            return v
        allowed_permissions = [p.value for p in ApiKeyPermission]
        for perm in v:
            if perm not in allowed_permissions:
                raise ValueError(f"Invalid permission: {perm}. Allowed: {allowed_permissions}")
        return v


class ApiKeyResponse(BaseModel):
    """Schema for API key response."""
    id: UUID
    name: str
    key: str
    environment: ApiKeyEnvironment
    permissions: List[str]
    rate_limit: int
    ip_whitelist: Optional[List[str]]
    description: Optional[str]
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    usage_count: int
    monthly_usage: int
    usage_percentage: float

    class Config:
        orm_mode = True

    @classmethod
    def from_orm(cls, obj):
        """Create response from ORM object, calculating usage percentage."""
        usage_percentage = min((obj.monthly_usage / obj.rate_limit) * 100, 100) if obj.rate_limit > 0 else 0
        return cls(
            id=obj.id,
            name=obj.name,
            key=obj.key,
            environment=obj.environment,
            permissions=obj.permissions,
            rate_limit=obj.rate_limit,
            ip_whitelist=obj.ip_whitelist,
            description=obj.description,
            is_active=obj.is_active,
            created_at=obj.created_at,
            expires_at=obj.expires_at,
            last_used_at=obj.last_used_at,
            usage_count=obj.usage_count,
            monthly_usage=obj.monthly_usage,
            usage_percentage=usage_percentage
        )


class ApiKeyActivityResponse(BaseModel):
    """Schema for API key activity response."""
    id: UUID
    api_key_id: UUID
    action: ApiKeyAction
    status: str
    ip_address: str
    user_agent: Optional[str]
    endpoint: Optional[str]
    response_status: Optional[int]
    response_time_ms: Optional[int]
    additional_metadata: Optional[Dict[str, Any]]
    timestamp: datetime

    class Config:
        orm_mode = True


class ApiKeyStatsResponse(BaseModel):
    """Schema for API key statistics response."""
    total_keys: int
    active_keys: int
    total_usage: int
    monthly_usage: int