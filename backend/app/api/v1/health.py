from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.job_errors import HealthChecker
from app.api.dependencies import get_current_user, get_current_organization
from app.models.user import User
from app.models.organization import Organization
from typing import Dict, Any

router = APIRouter()

@router.get("/health")
def health_check():
    """Basic health check endpoint."""
    return HealthChecker.health_check()

@router.get("/health/detailed")
def detailed_health_check(
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Detailed health check for authenticated users."""
    return HealthChecker.health_check()

@router.get("/health/database")
def database_health_check():
    """Check database health."""
    return HealthChecker.check_database()

@router.get("/health/redis")
def redis_health_check():
    """Check Redis health."""
    return HealthChecker.check_redis()

@router.get("/health/minio")
def minio_health_check():
    """Check MinIO health."""
    return HealthChecker.check_minio()

@router.get("/health/celery")
def celery_health_check():
    """Check Celery health."""
    return HealthChecker.check_celery()