from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.api_key import ApiKeyEnvironment, ApiKeyPermission
from app.services.api_key_service import ApiKeyService
from app.schemas.api_key import (
    ApiKeyCreate,
    ApiKeyResponse,
    ApiKeyUpdate,
    ApiKeyActivityResponse,
    ApiKeyStatsResponse
)

router = APIRouter()


@router.get("/test", response_model=List[ApiKeyResponse])
async def test_api_keys(
    db: AsyncSession = Depends(get_db)
):
    """Test endpoint without authentication."""
    service = ApiKeyService(db)
    
    # Use the test user ID directly
    from uuid import UUID
    user_id = UUID('b03e5987-a17f-431a-ab4e-e1d2b55d1314')
    
    api_keys = await service.get_user_api_keys(
        user_id=user_id,
        skip=0,
        limit=100
    )
    
    return [ApiKeyResponse.from_orm(key) for key in api_keys]


@router.get("/", response_model=List[ApiKeyResponse])
async def get_api_keys(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    environment: Optional[ApiKeyEnvironment] = Query(None),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all API keys for the current user."""
    service = ApiKeyService(db)
    api_keys = await service.get_user_api_keys(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        environment=environment,
        is_active=is_active,
        search=search
    )
    
    return [ApiKeyResponse.from_orm(key) for key in api_keys]


@router.get("/stats", response_model=ApiKeyStatsResponse)
async def get_api_key_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get API key usage statistics."""
    service = ApiKeyService(db)
    stats = await service.get_usage_statistics(current_user.id)
    return ApiKeyStatsResponse(**stats)


@router.post("/", response_model=ApiKeyResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    api_key_data: ApiKeyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new API key."""
    service = ApiKeyService(db)
    
    try:
        api_key = service.create_api_key(
            user_id=current_user.id,
            name=api_key_data.name,
            environment=api_key_data.environment,
            permissions=api_key_data.permissions,
            rate_limit=api_key_data.rate_limit,
            ip_whitelist=api_key_data.ip_whitelist,
            description=api_key_data.description,
            expires_at=api_key_data.expires_at
        )
        
        return ApiKeyResponse.from_orm(api_key)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create API key: {str(e)}"
        )


@router.get("/{key_id}", response_model=ApiKeyResponse)
async def get_api_key(
    key_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific API key."""
    service = ApiKeyService(db)
    api_key = service.get_api_key_by_id(key_id, current_user.id)
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    return ApiKeyResponse.from_orm(api_key)


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    key_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Revoke an API key."""
    service = ApiKeyService(db)
    
    if not service.revoke_api_key(key_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )


@router.post("/{key_id}/regenerate", response_model=ApiKeyResponse)
async def regenerate_api_key(
    key_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Regenerate an API key."""
    service = ApiKeyService(db)
    
    new_key = service.regenerate_api_key(key_id, current_user.id)
    if not new_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    return ApiKeyResponse.from_orm(new_key)


@router.get("/{key_id}/activities", response_model=List[ApiKeyActivityResponse])
async def get_api_key_activities(
    key_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get activity log for a specific API key."""
    service = ApiKeyService(db)
    activities = service.get_key_activities(key_id, current_user.id, skip, limit)
    
    return [ApiKeyActivityResponse.from_orm(activity) for activity in activities]