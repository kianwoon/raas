from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies import get_current_active_user

router = APIRouter()


@router.post("/run")
async def run_diagnostics(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Run diagnostics on a model."""
    return {"message": "Diagnostics run - implementation pending"}


@router.get("/runs/{run_id}")
async def get_diagnostics_run(
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get diagnostics run by ID."""
    return {"message": f"Diagnostics run {run_id} - implementation pending"}


@router.get("/runs/{run_id}/results")
async def get_diagnostics_results(
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get diagnostics run results."""
    return {"message": f"Diagnostics results for run {run_id} - implementation pending"}