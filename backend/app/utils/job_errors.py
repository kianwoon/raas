from typing import Dict, Any, Optional, List
from datetime import datetime
import structlog
import traceback
from app.models.job import JobStatus, JobType
from app.core.config import settings

logger = structlog.get_logger()

class JobError(Exception):
    """Base exception for job-related errors."""
    
    def __init__(self, message: str, job_id: Optional[str] = None, error_code: str = "JOB_ERROR"):
        self.message = message
        self.job_id = job_id
        self.error_code = error_code
        super().__init__(self.message)

class JobValidationError(JobError):
    """Exception for job validation errors."""
    
    def __init__(self, message: str, job_id: Optional[str] = None, field: Optional[str] = None):
        super().__init__(message, job_id, "JOB_VALIDATION_ERROR")
        self.field = field

class JobExecutionError(JobError):
    """Exception for job execution errors."""
    
    def __init__(self, message: str, job_id: Optional[str] = None, task_id: Optional[str] = None):
        super().__init__(message, job_id, "JOB_EXECUTION_ERROR")
        self.task_id = task_id

class JobTimeoutError(JobError):
    """Exception for job timeout errors."""
    
    def __init__(self, message: str, job_id: Optional[str] = None, timeout_seconds: Optional[int] = None):
        super().__init__(message, job_id, "JOB_TIMEOUT_ERROR")
        self.timeout_seconds = timeout_seconds

class JobCancellationError(JobError):
    """Exception for job cancellation errors."""
    
    def __init__(self, message: str, job_id: Optional[str] = None, reason: Optional[str] = None):
        super().__init__(message, job_id, "JOB_CANCELLATION_ERROR")
        self.reason = reason

class JobStorageError(JobError):
    """Exception for job storage/MinIO errors."""
    
    def __init__(self, message: str, job_id: Optional[str] = None, storage_operation: Optional[str] = None):
        super().__init__(message, job_id, "JOB_STORAGE_ERROR")
        self.storage_operation = storage_operation

class JobRetryLimitError(JobError):
    """Exception when job retry limit is exceeded."""
    
    def __init__(self, message: str, job_id: Optional[str] = None, retry_count: Optional[int] = None):
        super().__init__(message, job_id, "JOB_RETRY_LIMIT_ERROR")
        self.retry_count = retry_count

class JobLogger:
    """Enhanced logging for job operations."""
    
    def __init__(self, job_id: Optional[str] = None, job_type: Optional[JobType] = None):
        self.job_id = job_id
        self.job_type = job_type
        self.logger = logger.bind(job_id=job_id, job_type=job_type.value if job_type else None)
    
    def log_job_created(self, job_data: Dict[str, Any]) -> None:
        """Log job creation."""
        self.logger.info(
            "Job created",
            event="job_created",
            job_name=job_data.get("name"),
            job_type=job_data.get("job_type"),
            parameters=job_data.get("parameters"),
            priority=job_data.get("priority"),
            created_by=job_data.get("created_by")
        )
    
    def log_job_submitted(self, job_id: str, task_id: str) -> None:
        """Log job submission to Celery."""
        self.logger.info(
            "Job submitted to queue",
            event="job_submitted",
            job_id=job_id,
            task_id=task_id
        )
    
    def log_job_started(self, job_id: str, task_id: str, parameters: Dict[str, Any]) -> None:
        """Log job execution start."""
        self.logger.info(
            "Job execution started",
            event="job_started",
            job_id=job_id,
            task_id=task_id,
            parameters_count=len(parameters)
        )
    
    def log_job_progress(self, job_id: str, progress: int, message: Optional[str] = None) -> None:
        """Log job progress update."""
        self.logger.info(
            "Job progress updated",
            event="job_progress",
            job_id=job_id,
            progress=progress,
            message=message
        )
    
    def log_job_completed(self, job_id: str, duration_seconds: float, artifacts_count: int = 0) -> None:
        """Log job completion."""
        self.logger.info(
            "Job completed successfully",
            event="job_completed",
            job_id=job_id,
            duration_seconds=duration_seconds,
            artifacts_count=artifacts_count
        )
    
    def log_job_failed(self, job_id: str, error: str, error_type: str, traceback_info: Optional[str] = None) -> None:
        """Log job failure."""
        self.logger.error(
            "Job failed",
            event="job_failed",
            job_id=job_id,
            error=error,
            error_type=error_type,
            traceback=traceback_info
        )
    
    def log_job_cancelled(self, job_id: str, reason: Optional[str] = None) -> None:
        """Log job cancellation."""
        self.logger.info(
            "Job cancelled",
            event="job_cancelled",
            job_id=job_id,
            reason=reason
        )
    
    def log_job_retried(self, job_id: str, retry_count: int, max_retries: int) -> None:
        """Log job retry."""
        self.logger.warning(
            "Job retry initiated",
            event="job_retried",
            job_id=job_id,
            retry_count=retry_count,
            max_retries=max_retries
        )
    
    def log_job_timeout(self, job_id: str, timeout_seconds: int) -> None:
        """Log job timeout."""
        self.logger.error(
            "Job timed out",
            event="job_timeout",
            job_id=job_id,
            timeout_seconds=timeout_seconds
        )
    
    def log_artifact_upload(self, job_id: str, artifact_name: str, size: int, url: str) -> None:
        """Log artifact upload."""
        self.logger.info(
            "Artifact uploaded",
            event="artifact_upload",
            job_id=job_id,
            artifact_name=artifact_name,
            size=size,
            url=url
        )
    
    def log_artifact_download(self, job_id: str, artifact_name: str, size: int) -> None:
        """Log artifact download."""
        self.logger.info(
            "Artifact downloaded",
            event="artifact_download",
            job_id=job_id,
            artifact_name=artifact_name,
            size=size
        )
    
    def log_storage_error(self, operation: str, error: str, artifact_name: Optional[str] = None) -> None:
        """Log storage/MinIO error."""
        self.logger.error(
            "Storage operation failed",
            event="storage_error",
            operation=operation,
            error=error,
            artifact_name=artifact_name
        )
    
    def log_validation_error(self, field: str, error: str, value: Any) -> None:
        """Log validation error."""
        self.logger.warning(
            "Validation error",
            event="validation_error",
            field=field,
            error=error,
            value=value
        )
    
    def log_api_request(self, method: str, endpoint: str, user_id: str, status_code: int) -> None:
        """Log API request."""
        self.logger.info(
            "API request processed",
            event="api_request",
            method=method,
            endpoint=endpoint,
            user_id=user_id,
            status_code=status_code
        )
    
    def log_security_event(self, event_type: str, user_id: str, details: Dict[str, Any]) -> None:
        """Log security-related events."""
        self.logger.warning(
            "Security event",
            event="security_event",
            event_type=event_type,
            user_id=user_id,
            details=details
        )

def handle_job_errors(func):
    """Decorator to handle job-related errors."""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except JobError as e:
            # Re-raise job-specific errors
            raise
        except ValueError as e:
            raise JobValidationError(str(e))
        except TimeoutError as e:
            raise JobTimeoutError(str(e))
        except Exception as e:
            # Log unexpected errors
            logger.error(
                "Unexpected error in job operation",
                error=str(e),
                error_type=type(e).__name__,
                traceback=traceback.format_exc(),
                function=func.__name__
            )
            raise JobError(f"Unexpected error: {str(e)}")
    
    return wrapper

def validate_job_parameters(parameters: Dict[str, Any], required_fields: List[str]) -> None:
    """Validate job parameters."""
    missing_fields = []
    for field in required_fields:
        if field not in parameters:
            missing_fields.append(field)
    
    if missing_fields:
        raise JobValidationError(
            f"Missing required parameters: {', '.join(missing_fields)}",
            field="parameters"
        )

def validate_job_artifact(artifact: Dict[str, Any]) -> None:
    """Validate job artifact."""
    if not artifact.get("name"):
        raise JobValidationError("Artifact name is required", field="name")
    
    if not artifact.get("path") and not artifact.get("content"):
        raise JobValidationError("Artifact must have either path or content", field="artifact")

def log_performance_metrics(operation: str, duration_seconds: float, details: Optional[Dict[str, Any]] = None):
    """Log performance metrics."""
    logger.info(
        "Performance metric",
        event="performance_metric",
        operation=operation,
        duration_seconds=duration_seconds,
        details=details or {}
    )

def create_error_response(error_code: str, message: str, details: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Create standardized error response."""
    response = {
        "error": {
            "code": error_code,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
    }
    
    if details:
        response["error"]["details"] = details
    
    return response

def handle_storage_errors(func):
    """Decorator to handle storage-related errors."""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            error_type = type(e).__name__
            logger.error(
                "Storage operation failed",
                error=str(e),
                error_type=error_type,
                traceback=traceback.format_exc(),
                function=func.__name__
            )
            raise JobStorageError(f"Storage operation failed: {str(e)}")
    
    return wrapper

class HealthChecker:
    """Health check service for job system components."""
    
    @staticmethod
    def check_database():
        """Check database connectivity."""
        try:
            from app.core.database import SessionLocal
            db = SessionLocal()
            db.execute("SELECT 1")
            db.close()
            return {"status": "healthy", "component": "database"}
        except Exception as e:
            return {
                "status": "unhealthy",
                "component": "database",
                "error": str(e)
            }
    
    @staticmethod
    def check_redis():
        """Check Redis connectivity."""
        try:
            from app.core.config import settings
            import redis
            r = redis.Redis.from_url(settings.REDIS_URL)
            r.ping()
            return {"status": "healthy", "component": "redis"}
        except Exception as e:
            return {
                "status": "unhealthy",
                "component": "redis",
                "error": str(e)
            }
    
    @staticmethod
    def check_minio():
        """Check MinIO connectivity."""
        try:
            from app.services.minio_service import MinioService
            minio_service = MinioService()
            minio_service.client.list_buckets()
            return {"status": "healthy", "component": "minio"}
        except Exception as e:
            return {
                "status": "unhealthy",
                "component": "minio",
                "error": str(e)
            }
    
    @staticmethod
    def check_celery():
        """Check Celery worker availability."""
        try:
            from app.celery_app import celery_app
            inspect = celery_app.control.inspect()
            stats = inspect.stats()
            if stats:
                return {"status": "healthy", "component": "celery", "workers": len(stats)}
            else:
                return {
                    "status": "unhealthy",
                    "component": "celery",
                    "error": "No active workers"
                }
        except Exception as e:
            return {
                "status": "unhealthy",
                "component": "celery",
                "error": str(e)
            }
    
    @classmethod
    def health_check(cls):
        """Perform comprehensive health check."""
        checks = [
            cls.check_database(),
            cls.check_redis(),
            cls.check_minio(),
            cls.check_celery()
        ]
        
        overall_status = "healthy" if all(check["status"] == "healthy" for check in checks) else "unhealthy"
        
        return {
            "status": overall_status,
            "timestamp": datetime.utcnow().isoformat(),
            "checks": checks
        }