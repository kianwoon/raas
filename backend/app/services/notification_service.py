from typing import List, Dict, Any, Optional, Union
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import json
import logging
from datetime import datetime, timedelta
import asyncio
from dataclasses import dataclass
from enum import Enum

from app.models.model_card import ModelCard, ModelAuditLog
from app.models.fairness_assessment import FairnessAssessment
from app.models.diagnosis_assessment import DiagnosisAssessment
from app.crud.model_card import model_card

logger = logging.getLogger(__name__)


class NotificationType(str, Enum):
    MODEL_CARD_CREATED = "model_card_created"
    MODEL_CARD_UPDATED = "model_card_updated"
    MODEL_CARD_SUBMITTED_FOR_APPROVAL = "model_card_submitted_for_approval"
    MODEL_CARD_APPROVED = "model_card_approved"
    MODEL_CARD_REJECTED = "model_card_rejected"
    MODEL_CARD_CHANGES_REQUESTED = "model_card_changes_requested"
    MODEL_CARD_PUBLISHED = "model_card_published"
    MODEL_CARD_ARCHIVED = "model_card_archived"
    ASSESSMENT_COMPLETED = "assessment_completed"
    FAIRNESS_THRESHOLD_BREACHED = "fairness_threshold_breached"
    PERFORMANCE_DEGRADATION = "performance_degradation"
    DRIFT_DETECTED = "drift_detected"
    COMPLIANCE_EXPIRING = "compliance_expiring"
    APPROVAL_REMINDER = "approval_reminder"
    REPORT_GENERATED = "report_generated"
    EVIDENCE_PACK_READY = "evidence_pack_ready"


class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


@dataclass
class NotificationRecipient:
    user_id: UUID
    email: str
    name: str
    role: str
    notification_preferences: Dict[str, Any]


@dataclass
class NotificationMessage:
    id: UUID
    type: NotificationType
    priority: NotificationPriority
    title: str
    message: str
    recipients: List[NotificationRecipient]
    metadata: Dict[str, Any]
    created_at: datetime
    scheduled_for: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    delivery_methods: List[str] = None  # email, in_app, webhook, sms

    def __post_init__(self):
        if self.delivery_methods is None:
            self.delivery_methods = ["in_app", "email"]


class NotificationService:
    """
    Service for managing notifications related to model cards and assessments.
    Handles email, in-app, webhook, and SMS notifications.
    """

    def __init__(self):
        self.notification_queue = asyncio.Queue()
        self.delivery_handlers = {
            "email": self._send_email_notification,
            "in_app": self._send_in_app_notification,
            "webhook": self._send_webhook_notification,
            "sms": self._send_sms_notification
        }
        self.notification_templates = self._load_notification_templates()

    async def send_notification(
        self,
        *,
        notification_type: NotificationType,
        recipients: List[NotificationRecipient],
        title: str,
        message: str,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        metadata: Optional[Dict[str, Any]] = None,
        scheduled_for: Optional[datetime] = None,
        expires_at: Optional[datetime] = None,
        delivery_methods: Optional[List[str]] = None
    ) -> NotificationMessage:
        """
        Send a notification to specified recipients.
        """
        import uuid
        
        notification = NotificationMessage(
            id=uuid.uuid4(),
            type=notification_type,
            priority=priority,
            title=title,
            message=message,
            recipients=recipients,
            metadata=metadata or {},
            created_at=datetime.utcnow(),
            scheduled_for=scheduled_for,
            expires_at=expires_at,
            delivery_methods=delivery_methods
        )

        if scheduled_for and scheduled_for > datetime.utcnow():
            # Schedule notification for later
            await self._schedule_notification(notification)
        else:
            # Send immediately
            await self._deliver_notification(notification)

        return notification

    async def notify_model_card_created(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        created_by: str,
        recipients: List[NotificationRecipient]
    ):
        """
        Send notification when a model card is created.
        """
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            return

        title = f"New Model Card Created: {model_card_obj.name}"
        message = f"""
        A new model card has been created:
        
        Model: {model_card_obj.name}
        Version: {model_card_obj.version}
        Domain: {model_card_obj.domain}
        Risk Tier: {model_card_obj.risk_tier}
        Created by: {created_by}
        
        Click here to view the model card: /model-cards/{model_card_id}
        """

        await self.send_notification(
            notification_type=NotificationType.MODEL_CARD_CREATED,
            recipients=recipients,
            title=title,
            message=message,
            priority=NotificationPriority.MEDIUM,
            metadata={
                "model_card_id": str(model_card_id),
                "model_card_name": model_card_obj.name,
                "created_by": created_by
            }
        )

    async def notify_model_card_submitted_for_approval(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        approver_ids: List[UUID],
        submitter: str,
        approval_comments: str,
        recipients: List[NotificationRecipient]
    ):
        """
        Send notification when model card is submitted for approval.
        """
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            return

        title = f"Model Card Awaiting Approval: {model_card_obj.name}"
        message = f"""
        A model card has been submitted for your approval:
        
        Model: {model_card_obj.name}
        Version: {model_card_obj.version}
        Domain: {model_card_obj.domain}
        Risk Tier: {model_card_obj.risk_tier}
        Submitted by: {submitter}
        
        Comments: {approval_comments}
        
        Click here to review and approve: /model-cards/{model_card_id}/approval
        """

        await self.send_notification(
            notification_type=NotificationType.MODEL_CARD_SUBMITTED_FOR_APPROVAL,
            recipients=recipients,
            title=title,
            message=message,
            priority=NotificationPriority.HIGH,
            metadata={
                "model_card_id": str(model_card_id),
                "approver_ids": [str(approver_id) for approver_id in approver_ids],
                "submitter": submitter
            }
        )

    async def notify_model_card_approved(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        approver_id: UUID,
        approval_comments: str,
        recipients: List[NotificationRecipient]
    ):
        """
        Send notification when model card is approved.
        """
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            return

        title = f"Model Card Approved: {model_card_obj.name}"
        message = f"""
        Your model card has been approved:
        
        Model: {model_card_obj.name}
        Version: {model_card_obj.version}
        Status: Approved
        
        Approved by: {approver_id}
        Comments: {approval_comments}
        
        Click here to view the approved model card: /model-cards/{model_card_id}
        """

        await self.send_notification(
            notification_type=NotificationType.MODEL_CARD_APPROVED,
            recipients=recipients,
            title=title,
            message=message,
            priority=NotificationPriority.HIGH,
            metadata={
                "model_card_id": str(model_card_id),
                "approver_id": str(approver_id)
            }
        )

    async def notify_model_card_rejected(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        approver_id: UUID,
        rejection_reason: str,
        recipients: List[NotificationRecipient]
    ):
        """
        Send notification when model card is rejected.
        """
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            return

        title = f"Model Card Rejected: {model_card_obj.name}"
        message = f"""
        Your model card has been rejected:
        
        Model: {model_card_obj.name}
        Version: {model_card_obj.version}
        Status: Rejected
        
        Rejected by: {approver_id}
        Reason: {rejection_reason}
        
        Click here to review and resubmit: /model-cards/{model_card_id}
        """

        await self.send_notification(
            notification_type=NotificationType.MODEL_CARD_REJECTED,
            recipients=recipients,
            title=title,
            message=message,
            priority=NotificationPriority.HIGH,
            metadata={
                "model_card_id": str(model_card_id),
                "approver_id": str(approver_id),
                "rejection_reason": rejection_reason
            }
        )

    async def notify_assessment_completed(
        self,
        db: Session,
        *,
        assessment_id: UUID,
        assessment_type: str,  # fairness, diagnosis
        model_card_id: UUID,
        results_summary: Dict[str, Any],
        recipients: List[NotificationRecipient]
    ):
        """
        Send notification when assessment is completed.
        """
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            return

        overall_score = results_summary.get("overall_score", 0)
        status = "completed successfully"
        
        if assessment_type == "fairness":
            threshold_breached = overall_score < 0.7
            if threshold_breached:
                status = "completed with fairness concerns"
                await self._notify_fairness_threshold_breached(db, model_card_id, overall_score, recipients)
        elif assessment_type == "diagnosis":
            drift_detected = results_summary.get("drift_detected", False)
            if drift_detected:
                status = "completed with drift detected"
                await self._notify_drift_detected(db, model_card_id, results_summary, recipients)

        title = f"{assessment_type.title()} Assessment Completed: {model_card_obj.name}"
        message = f"""
        {assessment_type.title()} assessment has been {status}:
        
        Model: {model_card_obj.name}
        Version: {model_card_obj.version}
        Assessment Type: {assessment_type}
        Overall Score: {overall_score:.3f}
        
        Click here to view detailed results: /assessments/{assessment_id}
        """

        await self.send_notification(
            notification_type=NotificationType.ASSESSMENT_COMPLETED,
            recipients=recipients,
            title=title,
            message=message,
            priority=NotificationPriority.MEDIUM,
            metadata={
                "assessment_id": str(assessment_id),
                "assessment_type": assessment_type,
                "model_card_id": str(model_card_id),
                "overall_score": overall_score
            }
        )

    async def _notify_fairness_threshold_breached(
        self,
        db: Session,
        model_card_id: UUID,
        fairness_score: float,
        recipients: List[NotificationRecipient]
    ):
        """
        Send notification when fairness threshold is breached.
        """
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            return

        title = f"⚠️ Fairness Threshold Breached: {model_card_obj.name}"
        message = f"""
        ALERT: Fairness assessment has fallen below acceptable thresholds:
        
        Model: {model_card_obj.name}
        Version: {model_card_obj.version}
        Current Fairness Score: {fairness_score:.3f}
        Threshold: 0.700
        
        Immediate action required to address fairness concerns.
        
        Click here to review fairness metrics: /model-cards/{model_card_id}/fairness-analysis
        """

        await self.send_notification(
            notification_type=NotificationType.FAIRNESS_THRESHOLD_BREACHED,
            recipients=recipients,
            title=title,
            message=message,
            priority=NotificationPriority.HIGH,
            metadata={
                "model_card_id": str(model_card_id),
                "fairness_score": fairness_score,
                "threshold": 0.7
            }
        )

    async def _notify_drift_detected(
        self,
        db: Session,
        model_card_id: UUID,
        drift_results: Dict[str, Any],
        recipients: List[NotificationRecipient]
    ):
        """
        Send notification when drift is detected.
        """
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            return

        drift_severity = drift_results.get("drift_severity", "unknown")
        drift_percentage = drift_results.get("drift_percentage", 0)

        title = f"🚨 Model Drift Detected: {model_card_obj.name}"
        message = f"""
        ALERT: Model drift has been detected:
        
        Model: {model_card_obj.name}
        Version: {model_card_obj.version}
        Drift Severity: {drift_severity}
        Features Affected: {drift_percentage:.1f}%
        
        Immediate investigation required.
        
        Click here to review drift analysis: /model-cards/{model_card_id}/drift-status
        """

        await self.send_notification(
            notification_type=NotificationType.DRIFT_DETECTED,
            recipients=recipients,
            title=title,
            message=message,
            priority=NotificationPriority.HIGH,
            metadata={
                "model_card_id": str(model_card_id),
                "drift_severity": drift_severity,
                "drift_percentage": drift_percentage
            }
        )

    async def notify_compliance_expiring(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        framework_name: str,
        days_until_expiry: int,
        recipients: List[NotificationRecipient]
    ):
        """
        Send notification when compliance assessment is expiring.
        """
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            return

        priority = NotificationPriority.HIGH if days_until_expiry <= 7 else NotificationPriority.MEDIUM

        title = f"Compliance Assessment Expiring Soon: {model_card_obj.name}"
        message = f"""
        Compliance assessment is expiring soon:
        
        Model: {model_card_obj.name}
        Version: {model_card_obj.version}
        Framework: {framework_name}
        Days Until Expiry: {days_until_expiry}
        
        Please schedule a reassessment.
        
        Click here to review compliance status: /model-cards/{model_card_id}/compliance-status
        """

        await self.send_notification(
            notification_type=NotificationType.COMPLIANCE_EXPIRING,
            recipients=recipients,
            title=title,
            message=message,
            priority=priority,
            metadata={
                "model_card_id": str(model_card_id),
                "framework_name": framework_name,
                "days_until_expiry": days_until_expiry
            }
        )

    async def notify_approval_reminder(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        approver_id: UUID,
        days_pending: int,
        recipients: List[NotificationRecipient]
    ):
        """
        Send reminder for pending approval.
        """
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            return

        title = f"⏰ Approval Reminder: {model_card_obj.name}"
        message = f"""
        Reminder: Model card approval has been pending for {days_pending} days:
        
        Model: {model_card_obj.name}
        Version: {model_card_obj.version}
        Pending Since: {days_pending} days ago
        
        Please review and take action.
        
        Click here to review: /model-cards/{model_card_id}/approval
        """

        await self.send_notification(
            notification_type=NotificationType.APPROVAL_REMINDER,
            recipients=recipients,
            title=title,
            message=message,
            priority=NotificationPriority.MEDIUM,
            metadata={
                "model_card_id": str(model_card_id),
                "approver_id": str(approver_id),
                "days_pending": days_pending
            }
        )

    async def _deliver_notification(self, notification: NotificationMessage):
        """
        Deliver notification using specified methods.
        """
        delivery_tasks = []

        for method in notification.delivery_methods:
            if method in self.delivery_handlers:
                task = asyncio.create_task(self.delivery_handlers[method](notification))
                delivery_tasks.append(task)

        if delivery_tasks:
            await asyncio.gather(*delivery_tasks, return_exceptions=True)

    async def _schedule_notification(self, notification: NotificationMessage):
        """
        Schedule notification for future delivery.
        """
        # This would typically use a task queue like Celery or Redis
        # For now, we'll use asyncio's scheduling
        delay = (notification.scheduled_for - datetime.utcnow()).total_seconds()
        
        if delay > 0:
            await asyncio.sleep(delay)
            await self._deliver_notification(notification)

    async def _send_email_notification(self, notification: NotificationMessage):
        """
        Send email notification.
        """
        # This would integrate with an email service like SendGrid, AWS SES, etc.
        logger.info(f"Sending email notification: {notification.title}")
        
        # Mock email sending
        for recipient in notification.recipients:
            if recipient.email:
                logger.info(f"Email would be sent to {recipient.email}: {notification.title}")
                # Actual email sending logic would go here

    async def _send_in_app_notification(self, notification: NotificationMessage):
        """
        Send in-app notification.
        """
        # This would store notifications in the database for in-app display
        logger.info(f"Sending in-app notification: {notification.title}")
        
        # Mock in-app notification storage
        for recipient in notification.recipients:
            logger.info(f"In-app notification stored for user {recipient.user_id}: {notification.title}")
            # Actual database storage logic would go here

    async def _send_webhook_notification(self, notification: NotificationMessage):
        """
        Send webhook notification.
        """
        # This would send notifications to configured webhooks
        logger.info(f"Sending webhook notification: {notification.title}")
        
        # Mock webhook sending
        logger.info(f"Webhook would be triggered for notification: {notification.title}")
        # Actual webhook sending logic would go here

    async def _send_sms_notification(self, notification: NotificationMessage):
        """
        Send SMS notification.
        """
        # This would integrate with an SMS service like Twilio
        logger.info(f"Sending SMS notification: {notification.title}")
        
        # Mock SMS sending
        for recipient in notification.recipients:
            if recipient.notification_preferences.get("sms_enabled"):
                logger.info(f"SMS would be sent to {recipient.name}: {notification.title}")
                # Actual SMS sending logic would go here

    def _load_notification_templates(self) -> Dict[str, str]:
        """
        Load notification templates.
        """
        return {
            "model_card_created": """
            <h2>New Model Card Created</h2>
            <p>A new model card has been created in the RaaS platform.</p>
            <ul>
                <li><strong>Model:</strong> {model_name}</li>
                <li><strong>Version:</strong> {version}</li>
                <li><strong>Domain:</strong> {domain}</li>
                <li><strong>Risk Tier:</strong> {risk_tier}</li>
            </ul>
            <p><a href="{view_url}">View Model Card</a></p>
            """,
            
            "approval_required": """
            <h2>Approval Required</h2>
            <p>A model card requires your approval.</p>
            <ul>
                <li><strong>Model:</strong> {model_name}</li>
                <li><strong>Version:</strong> {version}</li>
                <li><strong>Submitted by:</strong> {submitter}</li>
            </ul>
            <p><a href="{approval_url}">Review and Approve</a></p>
            """,
            
            "fairness_alert": """
            <h2>⚠️ Fairness Alert</h2>
            <p>A model card has fallen below fairness thresholds.</p>
            <ul>
                <li><strong>Model:</strong> {model_name}</li>
                <li><strong>Fairness Score:</strong> {fairness_score}</li>
                <li><strong>Threshold:</strong> {threshold}</li>
            </ul>
            <p><a href="{analysis_url}">View Fairness Analysis</a></p>
            """
        }

    async def check_compliance_expiry(self, db: Session):
        """
        Check for expiring compliance assessments and send notifications.
        """
        from app.models.model_card import ModelCompliance
        from datetime import date

        # Find compliance records expiring within 30 days
        expiry_threshold = date.today() + timedelta(days=30)
        
        expiring_compliance = db.query(ModelCompliance).filter(
            ModelCompliance.next_assessment_date <= expiry_threshold,
            ModelCompliance.next_assessment_date >= date.today()
        ).all()

        for record in expiring_compliance:
            days_until_expiry = (record.next_assessment_date - date.today()).days
            
            # Get recipients for this model card
            recipients = self._get_model_card_recipients(db, record.model_card_id)
            
            if recipients:
                framework_name = record.framework.name if record.framework else "Unknown"
                await self.notify_compliance_expiring(
                    db=db,
                    model_card_id=record.model_card_id,
                    framework_name=framework_name,
                    days_until_expiry=days_until_expiry,
                    recipients=recipients
                )

    async def check_pending_approvals(self, db: Session):
        """
        Check for pending approvals and send reminders.
        """
        pending_model_cards = db.query(ModelCard).filter(
            ModelCard.status == "pending_approval"
        ).all()

        for model_card_obj in pending_model_cards:
            # Check how long it's been pending
            if model_card_obj.updated_at:
                days_pending = (datetime.utcnow() - model_card_obj.updated_at).days
                
                # Send reminder if pending for more than 3 days
                if days_pending >= 3:
                    recipients = self._get_approval_recipients(db, model_card_obj.id)
                    
                    if recipients:
                        for recipient in recipients:
                            await self.notify_approval_reminder(
                                db=db,
                                model_card_id=model_card_obj.id,
                                approver_id=recipient.user_id,
                                days_pending=days_pending,
                                recipients=[recipient]
                            )

    def _get_model_card_recipients(self, db: Session, model_card_id: UUID) -> List[NotificationRecipient]:
        """
        Get notification recipients for a model card.
        """
        # This would query the database for users who should receive notifications
        # For now, return mock recipients
        return [
            NotificationRecipient(
                user_id=UUID("00000000-0000-0000-0000-000000000001"),
                email="admin@example.com",
                name="System Administrator",
                role="admin",
                notification_preferences={"email_enabled": True, "in_app_enabled": True}
            )
        ]

    def _get_approval_recipients(self, db: Session, model_card_id: UUID) -> List[NotificationRecipient]:
        """
        Get approval recipients for a model card.
        """
        # This would query the database for approvers
        # For now, return mock recipients
        return [
            NotificationRecipient(
                user_id=UUID("00000000-0000-0000-0000-000000000002"),
                email="approver@example.com",
                name="Approver User",
                role="approver",
                notification_preferences={"email_enabled": True, "in_app_enabled": True}
            )
        ]

    async def start_background_tasks(self, db: Session):
        """
        Start background notification tasks.
        """
        # Schedule periodic checks
        asyncio.create_task(self._run_periodic_checks(db))

    async def _run_periodic_checks(self, db: Session):
        """
        Run periodic notification checks.
        """
        while True:
            try:
                # Check compliance expiry
                await self.check_compliance_expiry(db)
                
                # Check pending approvals
                await self.check_pending_approvals(db)
                
                # Wait for next check (every 24 hours)
                await asyncio.sleep(24 * 60 * 60)
                
            except Exception as e:
                logger.error(f"Error in periodic notification checks: {str(e)}")
                await asyncio.sleep(60 * 60)  # Wait 1 hour before retrying


notification_service = NotificationService()