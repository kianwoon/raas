from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from enum import Enum as PyEnum

from app.core.database import Base


class UserRole(PyEnum):
    """User roles enum."""
    model_owner = "model_owner"
    risk_governance = "risk_governance"
    auditor = "auditor"
    executive = "executive"
    regulator = "regulator"
    admin = "admin"


class User(Base):
    """User model."""
    
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    
    # User role and permissions
    role = Column(String(50), nullable=False, default="model_owner")
    
    # User status
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Organization information
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    organization = Column(String(255), nullable=True)  # Keep for backward compatibility
    department = Column(String(255), nullable=True)
    job_title = Column(String(255), nullable=True)
    
    # Profile information
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # OAuth information
    provider = Column(String(50), nullable=True)  # "google", "github", etc.
    provider_id = Column(String(255), nullable=True)  # Unique ID from OAuth provider
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization_rel = relationship("Organization", back_populates="users", foreign_keys=[organization_id])
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, username={self.username})>"