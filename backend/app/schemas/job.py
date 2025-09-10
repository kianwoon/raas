from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from app.models.job import JobStatus, JobType

class JobBase(BaseModel):
    job_type: JobType
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: int = Field(default=0, ge=0, le=10)
    parameters: Dict[str, Any] = Field(..., description="Job parameters")
    input_files: Optional[List[str]] = Field(default=None, description="List of input file references")
    max_retries: int = Field(default=3, ge=0, le=10)
    estimated_duration: Optional[int] = Field(default=None, ge=0, description="Estimated duration in seconds")
    tags: Optional[List[str]] = Field(default=None, description="Job tags")
    config: Optional[Dict[str, Any]] = Field(default=None, description="Additional job configuration")

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[int] = Field(default=None, ge=0, le=10)
    parameters: Optional[Dict[str, Any]] = Field(default=None, description="Job parameters")
    max_retries: Optional[int] = Field(default=None, ge=0, le=10)
    estimated_duration: Optional[int] = Field(default=None, ge=0, description="Estimated duration in seconds")
    tags: Optional[List[str]] = Field(default=None, description="Job tags")
    config: Optional[Dict[str, Any]] = Field(default=None, description="Additional job configuration")

class JobInDBBase(JobBase):
    id: UUID
    status: JobStatus
    celery_task_id: Optional[str] = None
    progress: int = Field(default=0, ge=0, le=100)
    error_message: Optional[str] = None
    retry_count: int = Field(default=0, ge=0)
    output_files: Optional[List[str]] = Field(default=None, description="List of output file references")
    artifact_urls: Optional[List[str]] = Field(default=None, description="List of artifact URLs")
    artifact_metadata: Optional[Dict[str, Any]] = Field(default=None, description="Artifact metadata")
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    actual_duration: Optional[int] = Field(default=None, ge=0, description="Actual duration in seconds")
    created_by: Optional[UUID] = None
    organization_id: Optional[UUID] = None
    
    class Config:
        from_attributes = True

class Job(JobInDBBase):
    pass

class JobInDB(JobInDBBase):
    pass

class JobResponse(Job):
    """Job response schema with additional computed fields"""
    is_running: bool = Field(default=False, description="Whether the job is currently running")
    is_completed: bool = Field(default=False, description="Whether the job has completed")
    is_failed: bool = Field(default=False, description="Whether the job has failed")
    is_cancelled: bool = Field(default=False, description="Whether the job was cancelled")
    can_retry: bool = Field(default=False, description="Whether the job can be retried")
    
    @field_validator("is_running", "is_completed", "is_failed", "is_cancelled", "can_retry", mode="before")
    @classmethod
    def compute_status_flags(cls, v, info):
        data = info.data
        if "status" in data:
            status = data["status"]
            retry_count = data.get("retry_count", 0)
            max_retries = data.get("max_retries", 3)
            
            field_name = info.field_name
            if field_name == "is_running":
                return status == JobStatus.RUNNING
            elif field_name == "is_completed":
                return status == JobStatus.COMPLETED
            elif field_name == "is_failed":
                return status == JobStatus.FAILED
            elif field_name == "is_cancelled":
                return status == JobStatus.CANCELLED
            elif field_name == "can_retry":
                return status == JobStatus.FAILED and retry_count < max_retries
        return v

class JobListResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
    page: int
    size: int
    
class JobSubmissionRequest(BaseModel):
    job_type: JobType
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    parameters: Dict[str, Any] = Field(..., description="Job parameters")
    input_files: Optional[List[str]] = Field(default=None, description="List of input file references")
    priority: int = Field(default=0, ge=0, le=10)
    max_retries: int = Field(default=3, ge=0, le=10)
    estimated_duration: Optional[int] = Field(default=None, ge=0, description="Estimated duration in seconds")
    tags: Optional[List[str]] = Field(default=None, description="Job tags")
    config: Optional[Dict[str, Any]] = Field(default=None, description="Additional job configuration")

class JobCancelRequest(BaseModel):
    reason: Optional[str] = Field(default=None, description="Reason for cancellation")

class JobRetryRequest(BaseModel):
    retry_parameters: Optional[Dict[str, Any]] = Field(default=None, description="Updated parameters for retry")

class JobArtifact(BaseModel):
    name: str
    url: str
    size: Optional[int] = None
    content_type: Optional[str] = None
    created_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class JobArtifactResponse(BaseModel):
    job_id: UUID
    artifacts: List[JobArtifact]
    total_size: Optional[int] = None