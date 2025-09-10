from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies import get_current_active_user

router = APIRouter()


@router.get("/")
async def list_models(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """List all models."""
    # TODO: Implement model listing
    return {"message": "Models endpoint - implementation pending"}


@router.post("/")
async def create_model(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Create a new model."""
    # TODO: Implement model creation
    return {"message": "Model creation - implementation pending"}


@router.get("/{model_id}")
async def get_model(
    model_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get model by ID."""
    # TODO: Implement model retrieval
    return {"message": f"Model {model_id} - implementation pending"}


@router.put("/{model_id}")
async def update_model(
    model_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Update model."""
    # TODO: Implement model update
    return {"message": f"Model {model_id} update - implementation pending"}


@router.delete("/{model_id}")
async def delete_model(
    model_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Delete model."""
    # TODO: Implement model deletion
    return {"message": f"Model {model_id} deletion - implementation pending"}