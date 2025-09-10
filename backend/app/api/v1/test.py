from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies import get_current_active_user

router = APIRouter()


@router.get("/hot-reload-test")
async def hot_reload_test(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Test endpoint to verify hot reload functionality."""
    return {
        "message": "Hot reload is working! Change this message and save to test.",
        "timestamp": "2024-09-08T12:53:00Z",
        "status": "active"
    }


@router.get("/version")
async def get_version():
    """Get API version information."""
    return {
        "version": "1.0.0",
        "environment": "development",
        "hot_reload_enabled": True
    }