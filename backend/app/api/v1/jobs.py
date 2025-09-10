from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from uuid import UUID
from app.api.dependencies import get_db, get_current_user, get_current_organization
from app.models.user import User
from app.models.organization import Organization
from app.models.job import JobStatus, JobType
from app.schemas.job import (
    Job,
    JobCreate,
    JobUpdate,
    JobResponse,
    JobListResponse,
    JobSubmissionRequest,
    JobCancelRequest,
    JobRetryRequest,
    JobArtifactResponse
)
from app.services.job_service import JobService
import structlog

logger = structlog.get_logger()

router = APIRouter()

@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def submit_job(
    job_request: JobSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Submit a new job for execution."""
    try:
        job_service = JobService()
        job = job_service.submit_job(db, job_request, current_user.id, current_organization.id)
        return job
    except Exception as e:
        logger.error(f"Failed to submit job: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit job: {str(e)}"
        )

@router.get("/jobs", response_model=JobListResponse)
def get_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    job_type: Optional[JobType] = Query(None, description="Filter by job type"),
    status: Optional[JobStatus] = Query(None, description="Filter by status"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_desc: bool = Query(True, description="Sort descending"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get jobs with filtering and pagination."""
    try:
        job_service = JobService()
        
        # Get jobs
        jobs = job_service.get_jobs(
            db=db,
            user_id=current_user.id,
            organization_id=current_organization.id,
            job_type=job_type,
            status=status,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            sort_desc=sort_desc
        )
        
        # Get total count
        total = job_service.count_jobs(
            db=db,
            user_id=current_user.id,
            organization_id=current_organization.id,
            job_type=job_type,
            status=status
        )
        
        return JobListResponse(
            jobs=jobs,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
    except Exception as e:
        logger.error(f"Failed to get jobs: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get jobs: {str(e)}"
        )

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get a specific job by ID."""
    try:
        job_service = JobService()
        job = job_service.get_job(db, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if user has access to this job
        if job.created_by != current_user.id and job.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this job"
            )
        
        return job
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get job {job_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get job: {str(e)}"
        )

@router.put("/jobs/{job_id}", response_model=JobResponse)
def update_job(
    job_id: UUID,
    job_update: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Update a job."""
    try:
        job_service = JobService()
        job = job_service.get_job(db, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if user has access to this job
        if job.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this job"
            )
        
        updated_job = job_service.update_job(db, job_id, job_update)
        return updated_job
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update job {job_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update job: {str(e)}"
        )

@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Delete a job."""
    try:
        job_service = JobService()
        job = job_service.get_job(db, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if user has access to this job
        if job.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this job"
            )
        
        success = job_service.delete_job(db, job_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete job"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete job {job_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete job: {str(e)}"
        )

@router.post("/jobs/{job_id}/cancel", response_model=JobResponse)
def cancel_job(
    job_id: UUID,
    cancel_request: JobCancelRequest = Body(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Cancel a job."""
    try:
        job_service = JobService()
        job = job_service.get_job(db, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if user has access to this job
        if job.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this job"
            )
        
        cancelled_job = job_service.cancel_job(db, job_id, cancel_request.reason if cancel_request else None)
        return cancelled_job
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to cancel job {job_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel job: {str(e)}"
        )

@router.post("/jobs/{job_id}/retry", response_model=JobResponse)
def retry_job(
    job_id: UUID,
    retry_request: JobRetryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Retry a failed job."""
    try:
        job_service = JobService()
        job = job_service.get_job(db, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if user has access to this job
        if job.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this job"
            )
        
        retried_job = job_service.retry_job(db, job_id, retry_request.retry_parameters)
        return retried_job
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to retry job {job_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retry job: {str(e)}"
        )

@router.get("/jobs/{job_id}/artifacts", response_model=JobArtifactResponse)
def get_job_artifacts(
    job_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get job artifacts."""
    try:
        job_service = JobService()
        job = job_service.get_job(db, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Check if user has access to this job
        if job.created_by != current_user.id and job.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this job"
            )
        
        artifacts = job_service.get_job_artifacts(db, job_id)
        return JobArtifactResponse(**artifacts)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get artifacts for job {job_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get job artifacts: {str(e)}"
        )

@router.get("/jobs/stats")
def get_job_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get job statistics."""
    try:
        job_service = JobService()
        stats = job_service.get_job_stats(db, current_organization.id)
        return stats
    except Exception as e:
        logger.error(f"Failed to get job stats: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get job statistics: {str(e)}"
        )

@router.post("/jobs/cleanup")
def cleanup_old_jobs(
    days_to_keep: int = Query(30, ge=1, le=365, description="Number of days to keep"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Clean up old jobs."""
    try:
        job_service = JobService()
        deleted_count = job_service.cleanup_old_jobs(db, days_to_keep, current_organization.id)
        return {
            "message": f"Cleaned up {deleted_count} old jobs",
            "deleted_count": deleted_count
        }
    except Exception as e:
        logger.error(f"Failed to cleanup old jobs: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanup old jobs: {str(e)}"
        )