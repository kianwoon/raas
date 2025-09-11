from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy import and_, or_, desc, func
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import secrets
import uuid

from app.models.api_key import ApiKey, ApiKeyEnvironment, ApiKeyPermission, ApiKeyAction, ApiKeyActivity
from app.models.user import User


class ApiKeyService:
    """Service for managing API keys."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def generate_api_key(self, environment: ApiKeyEnvironment) -> str:
        """Generate a secure API key."""
        prefix = f"sk_{environment.value}"
        random_part = secrets.token_urlsafe(32)
        return f"{prefix}_{random_part}"
    
    def create_api_key(
        self,
        user_id: uuid.UUID,
        name: str,
        environment: ApiKeyEnvironment = ApiKeyEnvironment.development,
        permissions: List[str] = None,
        rate_limit: int = 1000,
        ip_whitelist: List[str] = None,
        description: str = None,
        expires_at: datetime = None
    ) -> ApiKey:
        """Create a new API key."""
        if permissions is None:
            permissions = ["read"]
        if ip_whitelist is None:
            ip_whitelist = []
        
        # Generate the API key
        key_value = self.generate_api_key(environment)
        
        # Create the API key record
        api_key = ApiKey(
            user_id=user_id,
            name=name,
            key=key_value,
            environment=environment,
            permissions=permissions,
            rate_limit=rate_limit,
            ip_whitelist=ip_whitelist,
            description=description,
            expires_at=expires_at,
            is_active=True
        )
        
        self.db.add(api_key)
        self.db.commit()
        self.db.refresh(api_key)
        
        # Log the creation activity
        self._log_activity(
            api_key_id=api_key.id,
            action=ApiKeyAction.created,
            ip_address="127.0.0.1",  # Will be overridden by middleware
            user_agent="API Key Management",
            status="success"
        )
        
        return api_key
    
    async def get_user_api_keys(
        self,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
        environment: Optional[ApiKeyEnvironment] = None,
        is_active: Optional[bool] = None,
        search: Optional[str] = None
    ) -> List[ApiKey]:
        """Get API keys for a user with filtering and pagination."""
        stmt = select(ApiKey).filter(ApiKey.user_id == user_id)
        
        if environment:
            stmt = stmt.filter(ApiKey.environment == environment)
        
        if is_active is not None:
            stmt = stmt.filter(ApiKey.is_active == is_active)
        
        if search:
            search_term = f"%{search}%"
            stmt = stmt.filter(
                or_(
                    ApiKey.name.ilike(search_term),
                    ApiKey.description.ilike(search_term)
                )
            )
        
        stmt = stmt.order_by(desc(ApiKey.created_at)).offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()
    
    def get_api_key_by_id(self, key_id: uuid.UUID, user_id: uuid.UUID) -> Optional[ApiKey]:
        """Get an API key by ID for a specific user."""
        return self.db.query(ApiKey).filter(
            and_(ApiKey.id == key_id, ApiKey.user_id == user_id)
        ).first()
    
    def get_api_key_by_value(self, key_value: str) -> Optional[ApiKey]:
        """Get an API key by its value (for authentication)."""
        return self.db.query(ApiKey).filter(ApiKey.key == key_value).first()
    
    def revoke_api_key(self, key_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        """Revoke an API key."""
        api_key = self.get_api_key_by_id(key_id, user_id)
        if not api_key:
            return False
        
        api_key.is_active = False
        api_key.revoked_at = datetime.utcnow()
        self.db.commit()
        
        # Log the revocation activity
        self._log_activity(
            api_key_id=api_key.id,
            action=ApiKeyAction.revoked,
            ip_address="127.0.0.1",
            user_agent="API Key Management",
            status="success"
        )
        
        return True
    
    def regenerate_api_key(self, key_id: uuid.UUID, user_id: uuid.UUID) -> Optional[ApiKey]:
        """Regenerate an API key (create new key and revoke old one)."""
        old_key = self.get_api_key_by_id(key_id, user_id)
        if not old_key:
            return None
        
        # Generate new key
        new_key_value = self.generate_api_key(old_key.environment)
        
        # Create new key with same properties
        new_key = ApiKey(
            user_id=old_key.user_id,
            name=old_key.name,
            key=new_key_value,
            environment=old_key.environment,
            permissions=old_key.permissions,
            rate_limit=old_key.rate_limit,
            ip_whitelist=old_key.ip_whitelist,
            description=old_key.description,
            expires_at=old_key.expires_at,
            is_active=True
        )
        
        self.db.add(new_key)
        
        # Revoke old key
        old_key.is_active = False
        old_key.revoked_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(new_key)
        
        # Log both activities
        self._log_activity(
            api_key_id=old_key.id,
            action=ApiKeyAction.regenerated,
            ip_address="127.0.0.1",
            user_agent="API Key Management",
            status="success"
        )
        
        self._log_activity(
            api_key_id=new_key.id,
            action=ApiKeyAction.created,
            ip_address="127.0.0.1",
            user_agent="API Key Management",
            status="success"
        )
        
        return new_key
    
    def validate_api_key(self, key_value: str, ip_address: str = None) -> Optional[ApiKey]:
        """Validate an API key and check permissions."""
        api_key = self.get_api_key_by_value(key_value)
        
        if not api_key:
            return None
        
        # Check if key is active
        if not api_key.is_active:
            return None
        
        # Check if key is expired
        if api_key.expires_at and api_key.expires_at < datetime.utcnow():
            return None
        
        # Check IP whitelist if specified
        if api_key.ip_whitelist and ip_address:
            if ip_address not in api_key.ip_whitelist:
                return None
        
        # Check rate limit
        if api_key.monthly_usage >= api_key.rate_limit:
            return None
        
        # Reset monthly usage if needed
        if api_key.last_month_reset < datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0):
            api_key.monthly_usage = 0
            api_key.last_month_reset = datetime.utcnow()
        
        return api_key
    
    def update_usage_stats(self, api_key_id: uuid.UUID, ip_address: str, user_agent: str, endpoint: str = None):
        """Update usage statistics for an API key."""
        api_key = self.db.query(ApiKey).filter(ApiKey.id == api_key_id).first()
        if not api_key:
            return
        
        # Update usage counters
        api_key.usage_count += 1
        api_key.monthly_usage += 1
        api_key.last_used_at = datetime.utcnow()
        
        self.db.commit()
        
        # Log the usage activity
        self._log_activity(
            api_key_id=api_key.id,
            action=ApiKeyAction.used,
            ip_address=ip_address,
            user_agent=user_agent,
            endpoint=endpoint,
            status="success"
        )
    
    def get_key_activities(
        self,
        key_id: uuid.UUID,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 50
    ) -> List[ApiKeyActivity]:
        """Get activity log for an API key."""
        return (
            self.db.query(ApiKeyActivity)
            .join(ApiKey)
            .filter(and_(ApiKeyActivity.api_key_id == key_id, ApiKey.user_id == user_id))
            .order_by(desc(ApiKeyActivity.timestamp))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    async def get_usage_statistics(self, user_id: uuid.UUID) -> Dict[str, Any]:
        """Get usage statistics for all user's API keys."""
        # Total keys
        total_keys_stmt = select(func.count(ApiKey.id)).filter(ApiKey.user_id == user_id)
        total_keys_result = await self.db.execute(total_keys_stmt)
        total_keys = total_keys_result.scalar() or 0
        
        # Active keys
        active_keys_stmt = select(func.count(ApiKey.id)).filter(
            and_(ApiKey.user_id == user_id, ApiKey.is_active == True)
        )
        active_keys_result = await self.db.execute(active_keys_stmt)
        active_keys = active_keys_result.scalar() or 0
        
        # Total usage
        total_usage_stmt = select(func.sum(ApiKey.usage_count)).filter(
            ApiKey.user_id == user_id
        )
        total_usage_result = await self.db.execute(total_usage_stmt)
        total_usage = total_usage_result.scalar() or 0
        
        # Monthly usage
        monthly_usage_stmt = select(func.sum(ApiKey.monthly_usage)).filter(
            and_(ApiKey.user_id == user_id, ApiKey.is_active == True)
        )
        monthly_usage_result = await self.db.execute(monthly_usage_stmt)
        monthly_usage = monthly_usage_result.scalar() or 0
        
        return {
            "total_keys": total_keys,
            "active_keys": active_keys,
            "total_usage": total_usage,
            "monthly_usage": monthly_usage
        }
    
    def _log_activity(
        self,
        api_key_id: uuid.UUID,
        action: ApiKeyAction,
        ip_address: str,
        user_agent: str,
        endpoint: str = None,
        status: str = "success",
        response_status: int = None,
        response_time_ms: int = None,
        additional_metadata: Dict[str, Any] = None
    ):
        """Log API key activity."""
        activity = ApiKeyActivity(
            api_key_id=api_key_id,
            action=action,
            ip_address=ip_address,
            user_agent=user_agent,
            endpoint=endpoint,
            status=status,
            response_status=response_status,
            response_time_ms=response_time_ms,
            additional_metadata=additional_metadata
        )
        
        self.db.add(activity)
        self.db.commit()