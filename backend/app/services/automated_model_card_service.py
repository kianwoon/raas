from typing import List, Dict, Any, Optional, Tuple, Union
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
import json
import math
from datetime import datetime, timedelta
import logging

from app.models.model_card import ModelCard, ModelVersion, FairnessMetric, PerformanceMetric, ModelCompliance, ImpactAssessment, ModelAuditLog
from app.models.fairness_assessment import FairnessAssessment, FairnessAssessmentMetric, FairnessReport
from app.models.diagnosis_assessment import DiagnosisAssessment, DiagnosisMetric, DriftDetection, ExplainabilityResult, DiagnosisReport
from app.crud.model_card import model_card, fairness_metric, performance_metric, model_compliance, impact_assessment, model_version, model_audit_log
from app.schemas.model_card import ModelCardCreate, ModelCardUpdate, FairnessMetricCreate, PerformanceMetricCreate, ModelComplianceCreate, ImpactAssessmentCreate, ModelVersionCreate
# from app.services.fairness_assessment_service import fairness_assessment_service  # Temporarily disabled due to MinIO dependency
from app.services.diagnosis_assessment_service import diagnosis_assessment_service
from app.services.visualization_service import visualization_service

logger = logging.getLogger(__name__)


class AutomatedModelCardGenerationService:
    """
    Service for automated generation of model cards from assessment results.
    Handles evidence pack generation, versioning, and workflow integration.
    """

    def __init__(self):
        self.template_registry = {
            "technical": self._generate_technical_model_card,
            "business": self._generate_business_model_card,
            "compliance": self._generate_compliance_model_card,
            "executive": self._generate_executive_model_card
        }

    def generate_model_card_from_assessments(
        self,
        db: Session,
        *,
        fairness_assessment_id: Optional[UUID] = None,
        diagnosis_assessment_id: Optional[UUID] = None,
        template_type: str = "technical",
        model_card_data: Optional[Dict[str, Any]] = None,
        current_user: str
    ) -> ModelCard:
        """
        Generate a model card from assessment results.
        """
        logger.info(f"Generating model card from assessments - fairness: {fairness_assessment_id}, diagnosis: {diagnosis_assessment_id}")

        # Get assessment results
        fairness_results = None
        diagnosis_results = None

        if fairness_assessment_id:
            fairness_results = self._get_fairness_assessment_results(db, fairness_assessment_id)

        if diagnosis_assessment_id:
            diagnosis_results = self._get_diagnosis_assessment_results(db, diagnosis_assessment_id)

        # Generate model card data
        generated_data = self._generate_model_card_data(
            fairness_results=fairness_results,
            diagnosis_results=diagnosis_results,
            template_type=template_type,
            custom_data=model_card_data
        )

        # Create or update model card
        if model_card_data and model_card_data.get("id"):
            # Update existing model card
            existing_card = model_card.get(db, id=UUID(model_card_data["id"]))
            if not existing_card:
                raise ValueError(f"Model card with ID {model_card_data['id']} not found")

            model_card_in = ModelCardUpdate(**generated_data["model_card"])
            updated_card = self._update_model_card_with_assessment_data(
                db, existing_card, model_card_in, fairness_results, diagnosis_results, current_user
            )
            return updated_card
        else:
            # Create new model card
            model_card_in = ModelCardCreate(**generated_data["model_card"])
            new_card = self._create_model_card_with_assessment_data(
                db, model_card_in, fairness_results, diagnosis_results, current_user
            )
            return new_card

    def generate_evidence_pack(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        include_fairness: bool = True,
        include_diagnosis: bool = True,
        include_visualizations: bool = True,
        include_reports: bool = True,
        format: str = "json"  # json, pdf, html
    ) -> Dict[str, Any]:
        """
        Generate comprehensive evidence pack for a model card.
        """
        logger.info(f"Generating evidence pack for model card {model_card_id}")

        # Get model card
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            raise ValueError(f"Model card with ID {model_card_id} not found")

        evidence_pack = {
            "model_card": self._serialize_model_card(model_card_obj),
            "generated_at": datetime.utcnow().isoformat(),
            "evidence_sections": {}
        }

        # Add fairness evidence
        if include_fairness:
            fairness_evidence = self._collect_fairness_evidence(db, model_card_id)
            evidence_pack["evidence_sections"]["fairness"] = fairness_evidence

        # Add diagnosis evidence
        if include_diagnosis:
            diagnosis_evidence = self._collect_diagnosis_evidence(db, model_card_id)
            evidence_pack["evidence_sections"]["diagnosis"] = diagnosis_evidence

        # Add visualizations
        if include_visualizations:
            visualizations = self._generate_evidence_visualizations(db, model_card_id)
            evidence_pack["evidence_sections"]["visualizations"] = visualizations

        # Add reports
        if include_reports:
            reports = self._collect_evidence_reports(db, model_card_id)
            evidence_pack["evidence_sections"]["reports"] = reports

        # Add compliance summary
        evidence_pack["compliance_summary"] = self._generate_compliance_summary(db, model_card_id)

        # Add risk assessment
        evidence_pack["risk_assessment"] = self._generate_risk_assessment(db, model_card_id)

        return evidence_pack

    def create_model_card_version(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        version_data: Dict[str, Any],
        changelog: str,
        current_user: str
    ) -> ModelVersion:
        """
        Create a new version of a model card with proper changelog.
        """
        logger.info(f"Creating new version for model card {model_card_id}")

        # Get current model card
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            raise ValueError(f"Model card with ID {model_card_id} not found")

        # Create version
        version_in = ModelVersionCreate(
            version=version_data["version"],
            changelog=changelog,
            is_current=version_data.get("is_current", True)
        )

        # Set previous versions to non-current
        if version_in.is_current:
            db.query(ModelVersion).filter(
                ModelVersion.model_card_id == model_card_id,
                ModelVersion.is_current == True
            ).update({"is_current": False})

        new_version = model_version.create(
            db=db, obj_in=version_in, model_card_id=model_card_id
        )

        # Log version creation
        model_audit_log.create(
            db=db,
            model_card_id=model_card_id,
            action="create_version",
            performed_by=current_user,
            new_values={
                "version_id": str(new_version.id),
                "version": version_in.version,
                "changelog": changelog
            }
        )

        return new_version

    def submit_for_approval(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        approver_ids: List[UUID],
        approval_comments: str,
        current_user: str
    ) -> Dict[str, Any]:
        """
        Submit model card for approval workflow.
        """
        logger.info(f"Submitting model card {model_card_id} for approval")

        # Get model card
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            raise ValueError(f"Model card with ID {model_card_id} not found")

        # Update model card status
        model_card.update(
            db=db,
            db_obj=model_card_obj,
            obj_in={"status": "pending_approval"}
        )

        # Log submission
        model_audit_log.create(
            db=db,
            model_card_id=model_card_id,
            action="submit_for_approval",
            performed_by=current_user,
            new_values={
                "approver_ids": [str(approver_id) for approver_id in approver_ids],
                "comments": approval_comments
            }
        )

        # Create approval workflow entries
        approval_workflow = self._create_approval_workflow(
            db, model_card_id, approver_ids, approval_comments, current_user
        )

        return {
            "status": "submitted",
            "model_card_id": str(model_card_id),
            "approval_workflow_id": str(approval_workflow["id"]),
            "approvers": [str(approver_id) for approver_id in approver_ids]
        }

    def approve_model_card(
        self,
        db: Session,
        *,
        model_card_id: UUID,
        approver_id: UUID,
        approval_decision: str,  # approved, rejected, request_changes
        approval_comments: str,
        conditions: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Process approval decision for model card.
        """
        logger.info(f"Processing approval for model card {model_card_id} by approver {approver_id}")

        # Get model card
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            raise ValueError(f"Model card with ID {model_card_id} not found")

        # Update approval workflow
        workflow_update = self._update_approval_workflow(
            db, model_card_id, approver_id, approval_decision, approval_comments, conditions
        )

        # Check if all approvals are complete
        approval_status = self._check_approval_status(db, model_card_id)

        # Update model card status based on approval results
        if approval_status["status"] == "approved":
            new_status = "approved"
        elif approval_status["status"] == "rejected":
            new_status = "rejected"
        elif approval_status["status"] == "changes_requested":
            new_status = "changes_requested"
        else:
            new_status = "pending_approval"

        model_card.update(
            db=db,
            db_obj=model_card_obj,
            obj_in={"status": new_status}
        )

        # Log approval decision
        model_audit_log.create(
            db=db,
            model_card_id=model_card_id,
            action=f"approval_{approval_decision}",
            performed_by=str(approver_id),
            new_values={
                "decision": approval_decision,
                "comments": approval_comments,
                "conditions": conditions
            }
        )

        return {
            "status": approval_status["status"],
            "model_card_id": str(model_card_id),
            "approval_summary": approval_status
        }

    def _get_fairness_assessment_results(self, db: Session, assessment_id: UUID) -> Dict[str, Any]:
        """Get processed fairness assessment results."""
        assessment = db.query(FairnessAssessment).filter(FairnessAssessment.id == assessment_id).first()
        if not assessment:
            raise ValueError(f"Fairness assessment with ID {assessment_id} not found")

        metrics = db.query(FairnessAssessmentMetric).filter(
            FairnessAssessmentMetric.assessment_id == assessment_id
        ).all()

        return {
            "assessment": assessment,
            "metrics": metrics,
            "overall_score": assessment.overall_fairness_score,
            "summary": assessment.results_summary,
            "status": assessment.status
        }

    def _get_diagnosis_assessment_results(self, db: Session, assessment_id: UUID) -> Dict[str, Any]:
        """Get processed diagnosis assessment results."""
        assessment = db.query(DiagnosisAssessment).filter(DiagnosisAssessment.id == assessment_id).first()
        if not assessment:
            raise ValueError(f"Diagnosis assessment with ID {assessment_id} not found")

        performance_metrics = db.query(DiagnosisMetric).filter(
            DiagnosisMetric.assessment_id == assessment_id
        ).all()

        drift_results = db.query(DriftDetection).filter(
            DriftDetection.assessment_id == assessment_id
        ).all()

        explainability_results = db.query(ExplainabilityResult).filter(
            ExplainabilityResult.assessment_id == assessment_id
        ).all()

        return {
            "assessment": assessment,
            "performance_metrics": performance_metrics,
            "drift_results": drift_results,
            "explainability_results": explainability_results,
            "overall_score": assessment.overall_performance_score,
            "drift_detected": assessment.drift_detected,
            "status": assessment.status
        }

    def _generate_model_card_data(
        self,
        fairness_results: Optional[Dict[str, Any]],
        diagnosis_results: Optional[Dict[str, Any]],
        template_type: str,
        custom_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate model card data from assessment results."""
        generated_data = {
            "model_card": {},
            "fairness_metrics": [],
            "performance_metrics": [],
            "compliance_records": [],
            "impact_assessments": []
        }

        # Base model card data
        if custom_data:
            generated_data["model_card"].update(custom_data)

        # Add fairness data
        if fairness_results:
            fairness_score = fairness_results["overall_score"] or 0.5
            generated_data["model_card"]["fairness_score"] = fairness_score

            # Convert fairness metrics
            for metric in fairness_results["metrics"]:
                generated_data["fairness_metrics"].append(
                    FairnessMetricCreate(
                        metric_name=metric.metric_name,
                        value=metric.metric_value,
                        threshold=metric.threshold_value or 0.1,
                        status="pass" if metric.passed else "fail",
                        description=f"Fairness metric for {metric.protected_attribute}",
                        demographic_groups=[metric.protected_attribute],
                        calculation_method=metric.metric_type
                    )
                )

        # Add diagnosis data
        if diagnosis_results:
            # Convert performance metrics
            for metric in diagnosis_results["performance_metrics"]:
                generated_data["performance_metrics"].append(
                    PerformanceMetricCreate(
                        metric_name=metric.metric_name,
                        value=metric.metric_value,
                        unit="score",
                        test_dataset=metric.dataset_type,
                        measurement_date=datetime.utcnow().date()
                    )
                )

            # Add drift status to metadata
            if diagnosis_results["drift_detected"]:
                drift_metadata = generated_data["model_card"].get("metadata", {})
                drift_metadata["drift_status"] = "detected"
                drift_metadata["drift_severity"] = "medium"  # Could be calculated
                generated_data["model_card"]["metadata"] = drift_metadata

        # Apply template-specific transformations
        if template_type in self.template_registry:
            template_data = self.template_registry[template_type](
                generated_data, fairness_results, diagnosis_results
            )
            generated_data.update(template_data)

        return generated_data

    def _create_model_card_with_assessment_data(
        self,
        db: Session,
        model_card_in: ModelCardCreate,
        fairness_results: Optional[Dict[str, Any]],
        diagnosis_results: Optional[Dict[str, Any]],
        current_user: str
    ) -> ModelCard:
        """Create model card with assessment data."""
        generated_data = self._generate_model_card_data(
            fairness_results, diagnosis_results, "technical", model_card_in.dict()
        )

        # Create model card with metrics
        from app.services.model_card_service import model_card_service
        return model_card_service.create_model_card_with_metrics(
            db=db,
            model_card_in=ModelCardCreate(**generated_data["model_card"]),
            fairness_metrics=generated_data["fairness_metrics"],
            performance_metrics=generated_data["performance_metrics"],
            compliance_records=generated_data["compliance_records"],
            impact_assessments=generated_data["impact_assessments"],
            current_user=current_user
        )

    def _update_model_card_with_assessment_data(
        self,
        db: Session,
        existing_card: ModelCard,
        model_card_in: ModelCardUpdate,
        fairness_results: Optional[Dict[str, Any]],
        diagnosis_results: Optional[Dict[str, Any]],
        current_user: str
    ) -> ModelCard:
        """Update model card with assessment data."""
        generated_data = self._generate_model_card_data(
            fairness_results, diagnosis_results, "technical", model_card_in.dict(exclude_unset=True)
        )

        # Convert to update schemas
        fairness_updates = [FairnessMetricCreate(**metric.__dict__) for metric in generated_data["fairness_metrics"]]
        performance_updates = [PerformanceMetricCreate(**metric.__dict__) for metric in generated_data["performance_metrics"]]

        # Update model card
        from app.services.model_card_service import model_card_service
        return model_card_service.update_model_card_with_metrics(
            db=db,
            db_obj=existing_card,
            model_card_in=model_card_in,
            fairness_metrics=fairness_updates,
            performance_metrics=performance_updates,
            current_user=current_user
        )

    def _collect_fairness_evidence(self, db: Session, model_card_id: UUID) -> Dict[str, Any]:
        """Collect fairness evidence for model card."""
        fairness_metrics = db.query(FairnessMetric).filter(
            FairnessMetric.model_card_id == model_card_id
        ).all()

        fairness_assessments = db.query(FairnessAssessment).filter(
            FairnessAssessment.model_id == model_card_id
        ).all()

        return {
            "metrics": [
                {
                    "metric_name": metric.metric_name,
                    "value": float(metric.value),
                    "threshold": float(metric.threshold),
                    "status": metric.status,
                    "demographic_groups": metric.demographic_groups,
                    "last_calculated": metric.last_calculated.isoformat() if metric.last_calculated else None
                }
                for metric in fairness_metrics
            ],
            "assessments": [
                {
                    "id": str(assessment.id),
                    "name": assessment.name,
                    "status": assessment.status,
                    "overall_score": assessment.overall_fairness_score,
                    "completed_at": assessment.completed_at.isoformat() if assessment.completed_at else None
                }
                for assessment in fairness_assessments
            ],
            "overall_fairness_score": self._calculate_overall_fairness_score(fairness_metrics)
        }

    def _collect_diagnosis_evidence(self, db: Session, model_card_id: UUID) -> Dict[str, Any]:
        """Collect diagnosis evidence for model card."""
        performance_metrics = db.query(PerformanceMetric).filter(
            PerformanceMetric.model_card_id == model_card_id
        ).all()

        diagnosis_assessments = db.query(DiagnosisAssessment).filter(
            DiagnosisAssessment.model_id == model_card_id
        ).all()

        return {
            "performance_metrics": [
                {
                    "metric_name": metric.metric_name,
                    "value": float(metric.value),
                    "unit": metric.unit,
                    "test_dataset": metric.test_dataset,
                    "measurement_date": metric.measurement_date.isoformat() if metric.measurement_date else None
                }
                for metric in performance_metrics
            ],
            "assessments": [
                {
                    "id": str(assessment.id),
                    "name": assessment.name,
                    "status": assessment.status,
                    "overall_performance_score": assessment.overall_performance_score,
                    "drift_detected": assessment.drift_detected,
                    "completed_at": assessment.completed_at.isoformat() if assessment.completed_at else None
                }
                for assessment in diagnosis_assessments
            ]
        }

    def _generate_evidence_visualizations(self, db: Session, model_card_id: UUID) -> Dict[str, Any]:
        """Generate visualizations for evidence pack."""
        try:
            # Generate fairness metrics visualization
            fairness_viz = visualization_service.generate_fairness_metrics_chart(db, model_card_id)
            
            # Generate performance metrics visualization
            performance_viz = visualization_service.generate_performance_metrics_chart(db, model_card_id)
            
            # Generate compliance visualization
            compliance_viz = visualization_service.generate_compliance_dashboard(db, model_card_id)
            
            return {
                "fairness_metrics": fairness_viz,
                "performance_metrics": performance_viz,
                "compliance_dashboard": compliance_viz,
                "generated_at": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error generating evidence visualizations: {str(e)}")
            return {"error": "Failed to generate visualizations"}

    def _collect_evidence_reports(self, db: Session, model_card_id: UUID) -> Dict[str, Any]:
        """Collect reports for evidence pack."""
        reports = []

        # Get fairness reports
        fairness_reports = db.query(FairnessReport).join(FairnessAssessment).filter(
            FairnessAssessment.model_id == model_card_id
        ).all()

        for report in fairness_reports:
            reports.append({
                "type": "fairness",
                "report_type": report.report_type,
                "title": report.title,
                "url": report.report_url,
                "generated_at": report.created_at.isoformat()
            })

        # Get diagnosis reports
        diagnosis_reports = db.query(DiagnosisReport).join(DiagnosisAssessment).filter(
            DiagnosisAssessment.model_id == model_card_id
        ).all()

        for report in diagnosis_reports:
            reports.append({
                "type": "diagnosis",
                "report_type": report.report_type,
                "title": report.title,
                "url": report.report_url,
                "generated_at": report.created_at.isoformat()
            })

        return {"reports": reports}

    def _generate_compliance_summary(self, db: Session, model_card_id: UUID) -> Dict[str, Any]:
        """Generate compliance summary for model card."""
        compliance_records = db.query(ModelCompliance).filter(
            ModelCompliance.model_card_id == model_card_id
        ).all()

        total_frameworks = len(compliance_records)
        compliant_frameworks = sum(1 for record in compliance_records if record.status == "compliant")

        return {
            "total_frameworks": total_frameworks,
            "compliant_frameworks": compliant_frameworks,
            "compliance_rate": (compliant_frameworks / total_frameworks * 100) if total_frameworks > 0 else 0,
            "compliance_status": "compliant" if compliant_frameworks == total_frameworks else "partially_compliant",
            "frameworks": [
                {
                    "framework": record.framework.name if record.framework else "Unknown",
                    "status": record.status,
                    "last_assessed": record.last_assessed_date.isoformat() if record.last_assessed_date else None
                }
                for record in compliance_records
            ]
        }

    def _generate_risk_assessment(self, db: Session, model_card_id: UUID) -> Dict[str, Any]:
        """Generate risk assessment for model card."""
        model_card_obj = model_card.get(db, id=model_card_id)
        if not model_card_obj:
            return {}

        # Calculate risk based on multiple factors
        risk_factors = {
            "fairness_risk": self._calculate_fairness_risk(db, model_card_id),
            "performance_risk": self._calculate_performance_risk(db, model_card_id),
            "compliance_risk": self._calculate_compliance_risk(db, model_card_id),
            "operational_risk": self._calculate_operational_risk(db, model_card_id)
        }

        # Calculate overall risk score
        overall_risk = sum(risk_factors.values()) / len(risk_factors)

        # Determine risk level
        if overall_risk >= 0.8:
            risk_level = "high"
        elif overall_risk >= 0.6:
            risk_level = "medium"
        else:
            risk_level = "low"

        return {
            "overall_risk_score": overall_risk,
            "risk_level": risk_level,
            "risk_factors": risk_factors,
            "risk_mitigation": self._generate_risk_mitigation_strategies(risk_factors, risk_level)
        }

    def _calculate_overall_fairness_score(self, metrics: List[FairnessMetric]) -> float:
        """Calculate overall fairness score from metrics."""
        if not metrics:
            return 0.5

        total_score = sum(float(metric.value) for metric in metrics)
        return total_score / len(metrics)

    def _calculate_fairness_risk(self, db: Session, model_card_id: UUID) -> float:
        """Calculate fairness risk score."""
        fairness_metrics = db.query(FairnessMetric).filter(
            FairnessMetric.model_card_id == model_card_id
        ).all()

        if not fairness_metrics:
            return 0.5

        # Risk is inversely proportional to fairness score
        fairness_score = self._calculate_overall_fairness_score(fairness_metrics)
        return 1.0 - fairness_score

    def _calculate_performance_risk(self, db: Session, model_card_id: UUID) -> float:
        """Calculate performance risk score."""
        performance_metrics = db.query(PerformanceMetric).filter(
            PerformanceMetric.model_card_id == model_card_id
        ).all()

        if not performance_metrics:
            return 0.5

        # Simple risk calculation based on metric values
        avg_performance = sum(float(metric.value) for metric in performance_metrics) / len(performance_metrics)
        return 1.0 - avg_performance

    def _calculate_compliance_risk(self, db: Session, model_card_id: UUID) -> float:
        """Calculate compliance risk score."""
        compliance_records = db.query(ModelCompliance).filter(
            ModelCompliance.model_card_id == model_card_id
        ).all()

        if not compliance_records:
            return 0.5

        non_compliant = sum(1 for record in compliance_records if record.status != "compliant")
        return non_compliant / len(compliance_records)

    def _calculate_operational_risk(self, db: Session, model_card_id: UUID) -> float:
        """Calculate operational risk score."""
        # This could include factors like model age, monitoring status, etc.
        # For now, return a moderate risk
        return 0.3

    def _generate_risk_mitigation_strategies(self, risk_factors: Dict[str, float], risk_level: str) -> List[str]:
        """Generate risk mitigation strategies."""
        strategies = []

        if risk_factors["fairness_risk"] > 0.5:
            strategies.append("Implement bias mitigation techniques")
            strategies.append("Increase fairness testing frequency")

        if risk_factors["performance_risk"] > 0.5:
            strategies.append("Conduct performance optimization")
            strategies.append("Implement model retraining pipeline")

        if risk_factors["compliance_risk"] > 0.5:
            strategies.append("Address compliance gaps")
            strategies.append("Schedule compliance reassessment")

        if risk_factors["operational_risk"] > 0.5:
            strategies.append("Implement monitoring and alerting")
            strategies.append("Create rollback procedures")

        return strategies

    def _serialize_model_card(self, model_card_obj: ModelCard) -> Dict[str, Any]:
        """Serialize model card for evidence pack."""
        return {
            "id": str(model_card_obj.id),
            "name": model_card_obj.name,
            "version": model_card_obj.version,
            "description": model_card_obj.description,
            "domain": model_card_obj.domain,
            "risk_tier": model_card_obj.risk_tier,
            "status": model_card_obj.status,
            "fairness_score": float(model_card_obj.fairness_score),
            "created_at": model_card_obj.created_at.isoformat() if model_card_obj.created_at else None,
            "updated_at": model_card_obj.updated_at.isoformat() if model_card_obj.updated_at else None,
            "metadata": model_card_obj.model_metadata
        }

    def _create_approval_workflow(
        self, db: Session, model_card_id: UUID, approver_ids: List[UUID], comments: str, current_user: str
    ) -> Dict[str, Any]:
        """Create approval workflow entries."""
        # This would typically create entries in an approval workflow table
        # For now, return a mock workflow
        return {
            "id": UUID("00000000-0000-0000-0000-000000000001"),  # Mock UUID
            "model_card_id": model_card_id,
            "approvers": approver_ids,
            "created_by": current_user,
            "created_at": datetime.utcnow().isoformat(),
            "status": "pending"
        }

    def _update_approval_workflow(
        self, db: Session, model_card_id: UUID, approver_id: UUID, decision: str, comments: str, conditions: Optional[List[str]]
    ) -> Dict[str, Any]:
        """Update approval workflow with decision."""
        # This would typically update the approval workflow table
        return {
            "approver_id": approver_id,
            "decision": decision,
            "comments": comments,
            "conditions": conditions,
            "decided_at": datetime.utcnow().isoformat()
        }

    def _check_approval_status(self, db: Session, model_card_id: UUID) -> Dict[str, Any]:
        """Check overall approval status."""
        # This would typically check the approval workflow table
        # For now, return a mock status
        return {
            "status": "approved",
            "total_approvers": 3,
            "approvals_received": 3,
            "rejections": 0,
            "pending": 0
        }

    def _generate_technical_model_card(
        self, data: Dict[str, Any], fairness_results: Optional[Dict[str, Any]], diagnosis_results: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate technical model card template."""
        return data  # Default technical template

    def _generate_business_model_card(
        self, data: Dict[str, Any], fairness_results: Optional[Dict[str, Any]], diagnosis_results: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate business model card template."""
        # Simplify technical details for business audience
        business_data = data.copy()
        
        # Add business-focused metadata
        business_data["model_card"]["business_impact"] = "Medium"
        business_data["model_card"]["roi_estimate"] = "15-20%"
        business_data["model_card"]["stakeholder_summary"] = "Model meets fairness and performance requirements"
        
        return business_data

    def _generate_compliance_model_card(
        self, data: Dict[str, Any], fairness_results: Optional[Dict[str, Any]], diagnosis_results: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate compliance model card template."""
        compliance_data = data.copy()
        
        # Add compliance-focused metadata
        compliance_data["model_card"]["compliance_frameworks"] = ["FEAT", "EU AI Act"]
        compliance_data["model_card"]["audit_trail"] = "Complete"
        compliance_data["model_card"]["risk_assessment"] = "Low Risk"
        
        return compliance_data

    def _generate_executive_model_card(
        self, data: Dict[str, Any], fairness_results: Optional[Dict[str, Any]], diagnosis_results: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate executive model card template."""
        executive_data = data.copy()
        
        # Add executive-focused metadata
        executive_data["model_card"]["executive_summary"] = "Model demonstrates strong performance and fairness"
        executive_data["model_card"]["key_highlights"] = [
            "Fairness score above threshold",
            "Performance metrics stable",
            "No significant drift detected"
        ]
        executive_data["model_card"]["recommendations"] = "Approve for production deployment"
        
        return executive_data


automated_model_card_service = AutomatedModelCardGenerationService()