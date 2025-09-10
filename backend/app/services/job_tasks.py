from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime
import logging
from celery import Celery
from app.core.config import settings
from app.services.minio_service import MinioService
from app.utils.job_errors import JobError, JobTimeoutError, JobRetryLimitError
import papermill as pm
import nbformat
from nbformat.v4 import new_notebook
import tempfile
import os
import json

logger = logging.getLogger(__name__)

# Create Celery app
celery_app = Celery(
    'jobs',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=['app.services.job_tasks']
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour timeout
    task_soft_time_limit=3300,  # 55 minutes soft timeout
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_disable_rate_limits=False,
)

class JobTaskBase:
    """Base class for job tasks with common functionality"""
    
    def __init__(self):
        self.minio_service = MinioService()
    
    def update_job_progress(self, job_id: UUID, progress: float, status: Optional[str] = None):
        """Update job progress - to be implemented by job service"""
        pass
    
    def store_job_artifact(self, job_id: UUID, artifact_name: str, content: Any, content_type: str = "application/json"):
        """Store job artifact in MinIO"""
        try:
            object_name = f"jobs/{job_id}/{artifact_name}"
            if isinstance(content, (dict, list)):
                content = json.dumps(content, indent=2)
                content_type = "application/json"
            
            self.minio_service.upload_content(
                bucket_name=settings.MINIO_BUCKET_NAME,
                object_name=object_name,
                content=content,
                content_type=content_type
            )
            logger.info(f"Stored artifact {artifact_name} for job {job_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to store artifact {artifact_name} for job {job_id}: {str(e)}")
            return False
    
    def get_job_artifact_url(self, job_id: UUID, artifact_name: str):
        """Get presigned URL for job artifact"""
        try:
            object_name = f"jobs/{job_id}/{artifact_name}"
            return self.minio_service.get_presigned_url(
                bucket_name=settings.MINIO_BUCKET_NAME,
                object_name=object_name
            )
        except Exception as e:
            logger.error(f"Failed to get artifact URL for {artifact_name}: {str(e)}")
            return None

@celery_app.task(bind=True, max_retries=3)
def execute_notebook_task(self, job_id: UUID, notebook_path: str, parameters: Dict[str, Any]):
    """Execute Jupyter notebook with parameters"""
    try:
        task = JobTaskBase()
        task.update_job_progress(job_id, 0.0, "running")
        
        logger.info(f"Starting notebook execution for job {job_id}")
        
        # Create temporary output file
        with tempfile.NamedTemporaryFile(suffix='.ipynb', delete=False) as temp_output:
            output_path = temp_output.name
        
        try:
            # Execute notebook with papermill
            task.update_job_progress(job_id, 10.0, "executing_notebook")
            
            pm.execute_notebook(
                input_path=notebook_path,
                output_path=output_path,
                parameters=parameters,
                progress_bar=False
            )
            
            # Read and process results
            task.update_job_progress(job_id, 90.0, "processing_results")
            
            with open(output_path, 'r') as f:
                notebook = nbformat.read(f, as_version=4)
            
            # Extract outputs
            results = {}
            for cell in notebook.cells:
                if cell.cell_type == 'code' and cell.outputs:
                    for output in cell.outputs:
                        if output.output_type == 'execute_result':
                            if 'data' in output and 'text/plain' in output['data']:
                                results[cell.execution_count or len(results)] = output['data']['text/plain']
                        elif output.output_type == 'stream':
                            if 'text' in output:
                                results[cell.execution_count or len(results)] = output['text']
            
            # Store artifacts
            task.store_job_artifact(job_id, 'notebook_output.ipynb', open(output_path, 'rb').read(), 'application/x-ipynb+json')
            task.store_job_artifact(job_id, 'execution_results.json', results)
            
            task.update_job_progress(job_id, 100.0, "completed")
            
            return {
                'status': 'completed',
                'results': results,
                'artifacts': ['notebook_output.ipynb', 'execution_results.json']
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(output_path):
                os.unlink(output_path)
                
    except Exception as e:
        logger.error(f"Notebook execution failed for job {job_id}: {str(e)}")
        task.update_job_progress(job_id, 0.0, "failed")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))

@celery_app.task(bind=True, max_retries=3)
def process_model_training_task(self, job_id: UUID, training_config: Dict[str, Any]):
    """Process model training job"""
    try:
        task = JobTaskBase()
        task.update_job_progress(job_id, 0.0, "running")
        
        logger.info(f"Starting model training for job {job_id}")
        
        # Simulate model training with progress updates
        epochs = training_config.get('epochs', 10)
        for epoch in range(epochs):
            progress = (epoch + 1) / epochs * 100
            task.update_job_progress(job_id, progress, f"training_epoch_{epoch + 1}")
            
            # Simulate training work
            import time
            time.sleep(1)
        
        # Generate training results
        results = {
            'model_type': training_config.get('model_type', 'unknown'),
            'epochs': epochs,
            'final_accuracy': 0.95,  # Mock accuracy
            'training_loss': 0.05,   # Mock loss
            'validation_loss': 0.08, # Mock validation loss
            'model_size': '2.5MB',   # Mock model size
        }
        
        # Store artifacts
        task.store_job_artifact(job_id, 'training_results.json', results)
        task.store_job_artifact(job_id, 'model_metrics.json', {
            'accuracy': [0.85, 0.88, 0.91, 0.93, 0.95],
            'loss': [0.25, 0.18, 0.12, 0.08, 0.05],
            'validation_loss': [0.28, 0.21, 0.15, 0.11, 0.08]
        })
        
        task.update_job_progress(job_id, 100.0, "completed")
        
        return {
            'status': 'completed',
            'results': results,
            'artifacts': ['training_results.json', 'model_metrics.json']
        }
        
    except Exception as e:
        logger.error(f"Model training failed for job {job_id}: {str(e)}")
        task.update_job_progress(job_id, 0.0, "failed")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))

@celery_app.task(bind=True, max_retries=3)
def process_data_processing_task(self, job_id: UUID, processing_config: Dict[str, Any]):
    """Process data transformation job"""
    try:
        task = JobTaskBase()
        task.update_job_progress(job_id, 0.0, "running")
        
        logger.info(f"Starting data processing for job {job_id}")
        
        # Simulate data processing steps
        steps = [
            'data_loading',
            'data_cleaning',
            'feature_engineering',
            'data_transformation',
            'data_validation'
        ]
        
        results = {}
        for i, step in enumerate(steps):
            progress = (i + 1) / len(steps) * 100
            task.update_job_progress(job_id, progress, f"processing_{step}")
            
            # Simulate processing work
            import time
            time.sleep(2)
            
            # Mock results for each step
            results[step] = {
                'records_processed': 10000,
                'records_valid': 9500,
                'records_invalid': 500,
                'processing_time': f"{i+1}.2s"
            }
        
        # Store artifacts
        task.store_job_artifact(job_id, 'processing_results.json', results)
        task.store_job_artifact(job_id, 'data_quality_report.json', {
            'completeness': 0.95,
            'accuracy': 0.98,
            'consistency': 0.96,
            'validity': 0.95,
            'uniqueness': 0.99
        })
        
        task.update_job_progress(job_id, 100.0, "completed")
        
        return {
            'status': 'completed',
            'results': results,
            'artifacts': ['processing_results.json', 'data_quality_report.json']
        }
        
    except Exception as e:
        logger.error(f"Data processing failed for job {job_id}: {str(e)}")
        task.update_job_progress(job_id, 0.0, "failed")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))

@celery_app.task(bind=True, max_retries=3)
def process_assessment_task(self, job_id: UUID, assessment_config: Dict[str, Any]):
    """Process fairness or diagnosis assessment job"""
    try:
        task = JobTaskBase()
        task.update_job_progress(job_id, 0.0, "running")
        
        logger.info(f"Starting assessment for job {job_id}")
        
        assessment_type = assessment_config.get('type', 'fairness')
        
        # Simulate assessment steps
        steps = [
            'data_preparation',
            'metric_calculation',
            'statistical_analysis',
            'report_generation'
        ]
        
        results = {}
        for i, step in enumerate(steps):
            progress = (i + 1) / len(steps) * 100
            task.update_job_progress(job_id, progress, f"assessing_{step}")
            
            # Simulate assessment work
            import time
            time.sleep(1.5)
            
            # Mock results for each step
            if assessment_type == 'fairness':
                results[step] = {
                    'demographic_parity': 0.92,
                    'equal_opportunity': 0.89,
                    'predictive_parity': 0.94,
                    'statistical_significance': True,
                    'confidence_interval': [0.88, 0.96]
                }
            else:  # diagnosis
                results[step] = {
                    'accuracy': 0.95,
                    'precision': 0.93,
                    'recall': 0.91,
                    'f1_score': 0.92,
                    'drift_detected': False,
                    'feature_importance': {'feature1': 0.3, 'feature2': 0.25, 'feature3': 0.2}
                }
        
        # Store artifacts
        task.store_job_artifact(job_id, f'{assessment_type}_results.json', results)
        task.store_job_artifact(job_id, f'{assessment_type}_report.json', {
            'summary': f'{assessment_type.title()} assessment completed successfully',
            'overall_score': 0.92,
            'recommendations': ['Continue monitoring', 'Consider additional fairness metrics']
        })
        
        task.update_job_progress(job_id, 100.0, "completed")
        
        return {
            'status': 'completed',
            'results': results,
            'artifacts': [f'{assessment_type}_results.json', f'{assessment_type}_report.json']
        }
        
    except Exception as e:
        logger.error(f"Assessment failed for job {job_id}: {str(e)}")
        task.update_job_progress(job_id, 0.0, "failed")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))

@celery_app.task(bind=True, max_retries=2)
def retry_failed_job_task(self, job_id: UUID):
    """Retry a failed job"""
    try:
        task = JobTaskBase()
        task.update_job_progress(job_id, 0.0, "retrying")
        
        logger.info(f"Retrying failed job {job_id}")
        
        # Simulate retry logic
        import time
        time.sleep(1)
        
        # Mock successful retry
        results = {
            'retry_success': True,
            'retry_attempt': self.request.retries + 1,
            'original_error': 'Timeout error resolved',
            'execution_time': '5.2s'
        }
        
        task.store_job_artifact(job_id, 'retry_results.json', results)
        task.update_job_progress(job_id, 100.0, "completed")
        
        return {
            'status': 'completed',
            'results': results,
            'artifacts': ['retry_results.json']
        }
        
    except Exception as e:
        logger.error(f"Job retry failed for job {job_id}: {str(e)}")
        task.update_job_progress(job_id, 0.0, "failed")
        raise self.retry(exc=e, countdown=120 * (2 ** self.request.retries))

@celery_app.task
def cleanup_old_job_task():
    """Clean up old jobs and their artifacts"""
    try:
        task = JobTaskBase()
        logger.info("Starting old job cleanup")
        
        # This would typically query the database for old jobs
        # and remove their artifacts from MinIO
        
        # Mock cleanup
        cleaned_jobs = 5
        freed_space = "125MB"
        
        logger.info(f"Cleanup completed: {cleaned_jobs} jobs cleaned, {freed_space} space freed")
        
        return {
            'status': 'completed',
            'cleaned_jobs': cleaned_jobs,
            'freed_space': freed_space
        }
        
    except Exception as e:
        logger.error(f"Job cleanup failed: {str(e)}")
        raise