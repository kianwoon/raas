from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text, ForeignKey, Integer, JSON, Float
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from enum import Enum as PyEnum

from app.core.database import Base


class ApiKeyEnvironment(PyEnum):
    """API key environment types."""
    development = "development"
    production = "production"


class ApiKeyPermission(PyEnum):
    """API key permission types."""
    read = "read"
    write = "write"
    delete = "delete"
    admin = "admin"


class ApiKeyAction(PyEnum):
    """API key action types for activity logging."""
    created = "created"
    used = "used"
    revoked = "revoked"
    regenerated = "regenerated"


class ApiKey(Base):
    """API Key model for managing access tokens."""
    
    __tablename__ = "api_keys"
    
    # Primary key and identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    key = Column(String(500), unique=True, index=True, nullable=False)
    
    # Ownership
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user = relationship("User", backref="api_keys")
    
    # Configuration
    environment = Column(Enum(ApiKeyEnvironment), nullable=False, default=ApiKeyEnvironment.development)
    permissions = Column(ARRAY(String), nullable=False, default=["read"])
    rate_limit = Column(Integer, nullable=False, default=1000)  # requests per month
    ip_whitelist = Column(ARRAY(String), nullable=True)
    
    # Metadata
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    
    # Usage statistics
    usage_count = Column(Integer, default=0, nullable=False)
    monthly_usage = Column(Integer, default=0, nullable=False)
    last_month_reset = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<ApiKey(id={self.id}, name={self.name}, environment={self.environment}, user_id={self.user_id})>"
    
    def get_usage_percentage(self):
        """Calculate monthly usage percentage."""
        if self.rate_limit == 0:
            return 0
        return min((self.monthly_usage / self.rate_limit) * 100, 100)
    
    def is_expired(self):
        """Check if the API key is expired."""
        if not self.expires_at:
            return False
        return self.expires_at < func.now()
    
    def is_rate_limited(self):
        """Check if the API key has exceeded its rate limit."""
        return self.monthly_usage >= self.rate_limit


class ApiKeyActivity(Base):
    """API Key activity log model."""
    
    __tablename__ = "api_key_activities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    api_key_id = Column(UUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=False)
    api_key = relationship("ApiKey", backref="activities")
    
    # Activity details
    action = Column(Enum(ApiKeyAction), nullable=False)
    status = Column(String(50), nullable=False, default="success")  # success, failed
    
    # Request information
    ip_address = Column(String(45), nullable=False)  # Support IPv6
    user_agent = Column(Text, nullable=True)
    endpoint = Column(String(500), nullable=True)
    method = Column(String(10), nullable=True)
    
    # Response information
    response_status = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    
    # Additional metadata
    additional_metadata = Column(JSON, nullable=True)
    
    # Timestamps
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<ApiKeyActivity(id={self.id}, action={self.action}, api_key_id={self.api_key_id})>"