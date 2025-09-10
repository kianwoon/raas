from sqlalchemy import Column, String, Text, DateTime, Boolean, JSON, UUID, ForeignKey, Integer, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum

class JobStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RETRYING = "retrying"

class JobType(str, enum.Enum):
    NOTEBOOK_EXECUTION = "notebook_execution"
    MODEL_TRAINING = "model_training"
    DATA_PROCESSING = "data_processing"
    ASSESSMENT = "assessment"
    REPORT_GENERATION = "report_generation"
    CLEANUP = "cleanup"

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_type = Column(Enum(JobType), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(JobStatus), nullable=False, default=JobStatus.PENDING)
    priority = Column(Integer, nullable=False, default=0)
    
    # Job configuration
    parameters = Column(JSON, nullable=False)
    input_files = Column(JSON)  # List of input file references
    output_files = Column(JSON)  # List of output file references
    
    # Execution details
    celery_task_id = Column(String(255), unique=True)
    progress = Column(Integer, default=0)  # 0-100 percentage
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    
    # Artifact storage
    artifact_urls = Column(JSON)  # List of artifact URLs from MinIO
    artifact_metadata = Column(JSON)  # Metadata about artifacts
    
    # Timing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    estimated_duration = Column(Integer)  # Estimated duration in seconds
    actual_duration = Column(Integer)  # Actual duration in seconds
    
    # User and organization
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    
    # Additional metadata
    tags = Column(JSON)
    config = Column(JSON)  # Additional job-specific configuration
    
    # Relationships
    user = relationship("User", backref="jobs")
    organization = relationship("Organization", backref="jobs")
    
    @property
    def is_running(self):
        return self.status == JobStatus.RUNNING
    
    @property
    def is_completed(self):
        return self.status == JobStatus.COMPLETED
    
    @property
    def is_failed(self):
        return self.status == JobStatus.FAILED
    
    @property
    def is_cancelled(self):
        return self.status == JobStatus.CANCELLED
    
    @property
    def can_retry(self):
        return self.is_failed and self.retry_count < self.max_retries
    
    def update_progress(self, progress: int):
        """Update job progress"""
        self.progress = max(0, min(100, progress))
    
    def mark_as_started(self):
        """Mark job as started"""
        self.status = JobStatus.RUNNING
        self.started_at = func.now()
    
    def mark_as_completed(self, artifact_urls=None, artifact_metadata=None):
        """Mark job as completed"""
        self.status = JobStatus.COMPLETED
        self.completed_at = func.now()
        self.progress = 100
        if artifact_urls:
            self.artifact_urls = artifact_urls
        if artifact_metadata:
            self.artifact_metadata = artifact_metadata
    
    def mark_as_failed(self, error_message=None):
        """Mark job as failed"""
        self.status = JobStatus.FAILED
        self.completed_at = func.now()
        if error_message:
            self.error_message = error_message
    
    def mark_as_cancelled(self):
        """Mark job as cancelled"""
        self.status = JobStatus.CANCELLED
        self.completed_at = func.now()
    
    def increment_retry(self):
        """Increment retry count"""
        self.retry_count += 1
        self.status = JobStatus.RETRYING
        self.error_message = None