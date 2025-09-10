from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies import get_current_active_user

router = APIRouter()


@router.get("/")
async def list_disclosures(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """List all disclosures."""
    return {"message": "Disclosures endpoint - implementation pending"}


@router.post("/")
async def create_disclosure(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Create a new disclosure."""
    return {"message": "Disclosure creation - implementation pending"}


@router.get("/{disclosure_id}")
async def get_disclosure(
    disclosure_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get disclosure by ID."""
    return {"message": f"Disclosure {disclosure_id} - implementation pending"}


@router.post("/{disclosure_id}/publish")
async def publish_disclosure(
    disclosure_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Publish disclosure."""
    return {"message": f"Disclosure {disclosure_id} publication - implementation pending"}