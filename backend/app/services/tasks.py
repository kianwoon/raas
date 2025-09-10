from celery import shared_task
from app.celery_app import celery_app
from app.models.model_card import ModelCard
from app.core.database import SessionLocal
from app.services.minio_service import MinioService
import structlog
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

logger = structlog.get_logger()

@shared_task(bind=True)
def process_assessment(self, assessment_id: str):
    """Process an assessment and generate results."""
    logger.info(f"Starting assessment processing for assessment {assessment_id}")
    
    db = SessionLocal()
    try:
        # Get model card from database
        model_card = db.query(ModelCard).filter(ModelCard.id == assessment_id).first()
        if not model_card:
            logger.error(f"Model card {assessment_id} not found")
            return {"status": "failed", "error": "Model card not found"}
        
        logger.info(f"Processing assessment for model card {assessment_id}")
        
        # Simulate assessment processing
        results = {
            "overall_score": 0.85,
            "fairness_metrics": {
                "demographic_parity": 0.92,
                "equal_opportunity": 0.88,
                "predictive_parity": 0.90
            },
            "performance_metrics": {
                "accuracy": 0.95,
                "precision": 0.93,
                "recall": 0.91
            },
            "recommendations": [
                "Monitor model performance regularly",
                "Consider retraining with more diverse data"
            ]
        }
        
        # Store results in MinIO
        minio_service = MinioService()
        result_object = f"assessments/{assessment_id}/results.json"
        minio_service.upload_content(
            bucket_name="assessments",
            object_name=result_object,
            content=json.dumps(results, indent=2),
            content_type="application/json"
        )
        
        logger.info(f"Assessment {assessment_id} completed successfully")
        
        return {
            "status": "completed",
            "assessment_id": assessment_id,
            "results": results,
            "result_object_path": result_object
        }
        
    except Exception as e:
        logger.error(f"Assessment processing failed for {assessment_id}: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
    finally:
        db.close()

@shared_task(bind=True)
def generate_report(self, assessment_id: str, report_type: str = "pdf"):
    """Generate a report for an assessment."""
    logger.info(f"Starting report generation for assessment {assessment_id}")
    
    db = SessionLocal()
    try:
        # Get model card from database
        model_card = db.query(ModelCard).filter(ModelCard.id == assessment_id).first()
        if not model_card:
            logger.error(f"Model card {assessment_id} not found")
            return {"status": "failed", "error": "Model card not found"}
        
        # Simulate report generation
        logger.info(f"Generating {report_type} report for assessment {assessment_id}")
        
        # Mock report generation
        report_data = {
            "title": f"Assessment Report - {model_card.name}",
            "assessment_id": assessment_id,
            "generated_at": datetime.utcnow().isoformat(),
            "report_type": report_type,
            "summary": {
                "overall_score": model_card.fairness_score,
                "model_name": model_card.name,
                "model_version": model_card.version
            }
        }
        
        # Store report in MinIO
        minio_service = MinioService()
        report_object = f"assessments/{assessment_id}/reports/{report_type}_report.json"
        minio_service.upload_content(
            bucket_name="assessments",
            object_name=report_object,
            content=json.dumps(report_data, indent=2),
            content_type="application/json"
        )
        
        logger.info(f"Report generation completed for assessment {assessment_id}")
        
        return {
            "status": "completed",
            "assessment_id": assessment_id,
            "report_type": report_type,
            "report_object_path": report_object
        }
        
    except Exception as e:
        logger.error(f"Report generation failed for assessment {assessment_id}: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
    finally:
        db.close()

@shared_task(bind=True)
def send_notification(self, notification_type: str, recipient_id: str, data: Dict[str, Any]):
    """Send a notification to a user."""
    logger.info(f"Sending {notification_type} notification to user {recipient_id}")
    
    try:
        # Mock notification sending
        logger.info(f"Notification {notification_type} sent to user {recipient_id}")
        
        return {
            "status": "completed",
            "notification_type": notification_type,
            "recipient_id": recipient_id
        }
        
    except Exception as e:
        logger.error(f"Failed to send notification to user {recipient_id}: {str(e)}")
        raise self.retry(exc=e, countdown=30 * (2 ** self.request.retries))

@shared_task
def cleanup_old_data():
    """Clean up old data and temporary files."""
    logger.info("Starting old data cleanup")
    
    db = SessionLocal()
    try:
        # Clean up old model cards (older than 90 days)
        cutoff_date = datetime.utcnow() - timedelta(days=90)
        old_model_cards = db.query(ModelCard).filter(
            ModelCard.created_at < cutoff_date
        ).all()
        
        minio_service = MinioService()
        cleaned_count = 0
        
        for model_card in old_model_cards:
            try:
                # Remove model card files from MinIO
                model_card_prefix = f"model_cards/{model_card.id}/"
                minio_service.delete_objects(
                    bucket_name="model-cards",
                    prefix=model_card_prefix
                )
                
                # Delete model card from database
                db.delete(model_card)
                cleaned_count += 1
                
            except Exception as e:
                logger.error(f"Failed to cleanup model card {model_card.id}: {str(e)}")
        
        db.commit()
        
        logger.info(f"Cleanup completed: {cleaned_count} old model cards removed")
        
        return {
            "status": "completed",
            "cleaned_model_cards": cleaned_count,
            "cutoff_date": cutoff_date.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Data cleanup failed: {str(e)}")
        raise
    finally:
        db.close()