from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from app.models.job import Job, JobStatus, JobType
from app.schemas.job import JobCreate, JobUpdate, JobSubmissionRequest
from app.services.job_tasks import (
    execute_notebook_task,
    process_model_training_task,
    process_data_processing_task,
    process_assessment_task,
    retry_failed_job_task
)
from app.services.minio_service import MinioService
import structlog

logger = structlog.get_logger()

class JobService:
    """Service for managing job lifecycle and operations."""
    
    def __init__(self):
        self.minio_service = MinioService()
    
    def create_job(self, db: Session, job_data: JobCreate, user_id: UUID, organization_id: UUID) -> Job:
        """Create a new job."""
        job = Job(
            **job_data.dict(),
            created_by=user_id,
            organization_id=organization_id
        )
        
        db.add(job)
        db.commit()
        db.refresh(job)
        
        logger.info(f"Created job {job.id} of type {job.job_type}")
        return job
    
    def get_job(self, db: Session, job_id: UUID) -> Optional[Job]:
        """Get a job by ID."""
        return db.query(Job).filter(Job.id == job_id).first()
    
    def get_jobs(
        self, 
        db: Session, 
        user_id: Optional[UUID] = None,
        organization_id: Optional[UUID] = None,
        job_type: Optional[JobType] = None,
        status: Optional[JobStatus] = None,
        skip: int = 0,
        limit: int = 100,
        sort_by: str = "created_at",
        sort_desc: bool = True
    ) -> List[Job]:
        """Get jobs with filtering and pagination."""
        query = db.query(Job)
        
        # Apply filters
        if user_id:
            query = query.filter(Job.created_by == user_id)
        if organization_id:
            query = query.filter(Job.organization_id == organization_id)
        if job_type:
            query = query.filter(Job.job_type == job_type)
        if status:
            query = query.filter(Job.status == status)
        
        # Apply sorting
        if sort_desc:
            query = query.order_by(desc(getattr(Job, sort_by)))
        else:
            query = query.order_by(getattr(Job, sort_by))
        
        # Apply pagination
        return query.offset(skip).limit(limit).all()
    
    def count_jobs(
        self, 
        db: Session, 
        user_id: Optional[UUID] = None,
        organization_id: Optional[UUID] = None,
        job_type: Optional[JobType] = None,
        status: Optional[JobStatus] = None
    ) -> int:
        """Count jobs with filtering."""
        query = db.query(Job)
        
        if user_id:
            query = query.filter(Job.created_by == user_id)
        if organization_id:
            query = query.filter(Job.organization_id == organization_id)
        if job_type:
            query = query.filter(Job.job_type == job_type)
        if status:
            query = query.filter(Job.status == status)
        
        return query.count()
    
    def update_job(self, db: Session, job_id: UUID, job_data: JobUpdate) -> Optional[Job]:
        """Update a job."""
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return None
        
        # Only allow updates to certain fields if job is not running
        if job.status not in [JobStatus.RUNNING, JobStatus.COMPLETED]:
            update_data = job_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(job, field, value)
            
            db.commit()
            db.refresh(job)
            
            logger.info(f"Updated job {job_id}")
        
        return job
    
    def delete_job(self, db: Session, job_id: UUID) -> bool:
        """Delete a job and its artifacts."""
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return False
        
        # Cancel the job if it's running
        if job.status == JobStatus.RUNNING and job.celery_task_id:
            self.cancel_job_task(job.celery_task_id)
        
        # Delete artifacts from MinIO
        try:
            self.minio_service.delete_job_artifacts(str(job_id))
        except Exception as e:
            logger.warning(f"Failed to delete artifacts for job {job_id}: {e}")
        
        # Delete job from database
        db.delete(job)
        db.commit()
        
        logger.info(f"Deleted job {job_id}")
        return True
    
    def submit_job(self, db: Session, job_request: JobSubmissionRequest, user_id: UUID, organization_id: UUID) -> Job:
        """Submit a new job for execution."""
        # Create job
        job_data = JobCreate(**job_request.dict())
        job = self.create_job(db, job_data, user_id, organization_id)
        
        # Dispatch job to appropriate task
        self.dispatch_job(job)
        
        return job
    
    def dispatch_job(self, job: Job) -> Dict[str, Any]:
        """Dispatch a job to the appropriate Celery task."""
        logger.info(f"Dispatching job {job.id} of type {job.job_type}")
        
        try:
            if job.job_type == JobType.NOTEBOOK_EXECUTION:
                task = execute_notebook_task.delay(str(job.id))
            elif job.job_type == JobType.MODEL_TRAINING:
                task = process_model_training_task.delay(str(job.id))
            elif job.job_type == JobType.DATA_PROCESSING:
                task = process_data_processing_task.delay(str(job.id))
            elif job.job_type == JobType.ASSESSMENT:
                # Check if it's a fairness assessment based on parameters
                if job.parameters.get("assessment_type") == "fairness" or "fairness" in job.parameters.get("notebook_template", "").lower():
                    task = process_assessment_task.delay(str(job.id), {"type": "fairness"})
                else:
                    task = process_assessment_task.delay(str(job.id), {"type": "diagnosis"})
            else:
                raise ValueError(f"Unsupported job type: {job.job_type}")
            
            # Update job with Celery task ID
            job.celery_task_id = task.id
            db = SessionLocal()
            try:
                db.commit()
                db.refresh(job)
            finally:
                db.close()
            
            logger.info(f"Dispatched job {job.id} with Celery task {task.id}")
            return {
                "task_id": task.id,
                "status": "dispatched",
                "job_id": str(job.id)
            }
            
        except Exception as e:
            logger.error(f"Failed to dispatch job {job.id}: {e}")
            
            # Mark job as failed
            db = SessionLocal()
            try:
                job.mark_as_failed(error_message=str(e))
                db.commit()
            finally:
                db.close()
            
            raise
    
    def cancel_job(self, db: Session, job_id: UUID, reason: Optional[str] = None) -> Optional[Job]:
        """Cancel a job."""
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return None
        
        if job.status in [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED]:
            raise ValueError(f"Cannot cancel job with status {job.status}")
        
        # Cancel Celery task if it exists
        if job.celery_task_id:
            self.cancel_job_task(job.celery_task_id)
        
        # Mark job as cancelled
        job.mark_as_cancelled()
        db.commit()
        db.refresh(job)
        
        logger.info(f"Cancelled job {job_id}")
        return job
    
    def retry_job(self, db: Session, job_id: UUID, retry_parameters: Optional[Dict[str, Any]] = None) -> Optional[Job]:
        """Retry a failed job."""
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return None
        
        if not job.can_retry:
            raise ValueError("Job cannot be retried")
        
        # Update parameters if provided
        if retry_parameters:
            job.parameters.update(retry_parameters)
        
        # Retry the job
        task = retry_failed_job_task.delay(str(job_id))
        
        # Update job with new task ID
        job.celery_task_id = task.id
        db.commit()
        db.refresh(job)
        
        logger.info(f"Retried job {job_id}")
        return job
    
    def update_job_progress(self, db: Session, job_id: UUID, progress: int) -> Optional[Job]:
        """Update job progress."""
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return None
        
        job.update_progress(progress)
        db.commit()
        db.refresh(job)
        
        return job
    
    def get_job_artifacts(self, db: Session, job_id: UUID) -> Dict[str, Any]:
        """Get job artifacts."""
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {}
        
        artifacts = []
        total_size = 0
        
        if job.artifact_urls:
            for url in job.artifact_urls:
                try:
                    # Extract object name from URL
                    object_name = url.split(f"/{self.minio_service.bucket_name}/")[-1]
                    file_info = self.minio_service.get_file_info(object_name)
                    artifacts.append(file_info)
                    total_size += file_info.get("size", 0)
                except Exception as e:
                    logger.warning(f"Failed to get info for artifact {url}: {e}")
        
        return {
            "job_id": job_id,
            "artifacts": artifacts,
            "total_size": total_size,
            "artifact_metadata": job.artifact_metadata
        }
    
    def cancel_job_task(self, task_id: str) -> bool:
        """Cancel a Celery task."""
        try:
            from app.celery_app import celery_app
            result = celery_app.AsyncResult(task_id)
            
            if result.state in ["PENDING", "STARTED"]:
                result.revoke(terminate=True)
                logger.info(f"Cancelled Celery task {task_id}")
                return True
            else:
                logger.warning(f"Cannot cancel task {task_id} in state {result.state}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to cancel Celery task {task_id}: {e}")
            return False
    
    def get_job_stats(self, db: Session, organization_id: Optional[UUID] = None) -> Dict[str, Any]:
        """Get job statistics."""
        query = db.query(Job)
        if organization_id:
            query = query.filter(Job.organization_id == organization_id)
        
        total_jobs = query.count()
        
        status_counts = {}
        for status in JobStatus:
            status_counts[status.value] = query.filter(Job.status == status).count()
        
        type_counts = {}
        for job_type in JobType:
            type_counts[job_type.value] = query.filter(Job.job_type == job_type).count()
        
        # Average duration for completed jobs
        completed_jobs = query.filter(Job.status == JobStatus.COMPLETED).all()
        avg_duration = None
        if completed_jobs:
            durations = [job.actual_duration for job in completed_jobs if job.actual_duration]
            if durations:
                avg_duration = sum(durations) / len(durations)
        
        return {
            "total_jobs": total_jobs,
            "status_counts": status_counts,
            "type_counts": type_counts,
            "average_duration": avg_duration
        }
    
    def cleanup_old_jobs(self, db: Session, days_to_keep: int = 30, organization_id: Optional[UUID] = None) -> int:
        """Clean up old completed/failed jobs."""
        from datetime import timedelta
        
        cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
        
        query = db.query(Job).filter(
            and_(
                Job.completed_at < cutoff_date,
                or_(Job.status == JobStatus.COMPLETED, Job.status == JobStatus.FAILED)
            )
        )
        
        if organization_id:
            query = query.filter(Job.organization_id == organization_id)
        
        old_jobs = query.all()
        deleted_count = 0
        
        for job in old_jobs:
            try:
                self.delete_job(db, job.id)
                deleted_count += 1
            except Exception as e:
                logger.error(f"Failed to delete old job {job.id}: {e}")
        
        logger.info(f"Cleaned up {deleted_count} old jobs")
        return deleted_count