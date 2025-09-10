from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
import json
import structlog

from app.models.fairness_assessment import (
    FairnessAssessment, 
    FairnessAssessmentMetric,
    FairnessThreshold,
    FairnessReport,
    FairnessAssessmentStatus,
    FairnessMetricType,
    FairnessThresholdType
)
from app.schemas.fairness_assessment import (
    FairnessAssessmentCreate,
    FairnessAssessmentUpdate,
    FairnessAssessmentExecutionRequest,
    FairnessAssessmentConfigurationWizard,
    FairnessAssessmentWizardResponse,
    FairnessReportRequest,
    FairnessVisualizationConfig
)
from app.services.job_service import JobService
from app.models.job import JobType
import numpy as np

logger = structlog.get_logger()

class FairnessAssessmentService:
    """Service for managing fairness assessments."""
    
    def __init__(self):
        self.job_service = JobService()
    
    def create_assessment(self, db: Session, assessment_data: FairnessAssessmentCreate, user_id: UUID, organization_id: UUID) -> FairnessAssessment:
        """Create a new fairness assessment."""
        # Convert Pydantic models to JSON-compatible dictionaries
        protected_attributes = [attr.dict() for attr in assessment_data.protected_attributes]
        fairness_thresholds = [threshold.dict() for threshold in assessment_data.fairness_thresholds]
        
        assessment = FairnessAssessment(
            **assessment_data.dict(exclude={'protected_attributes', 'fairness_thresholds'}),
            protected_attributes=protected_attributes,
            fairness_thresholds=fairness_thresholds,
            created_by=user_id,
            organization_id=organization_id
        )
        
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        
        logger.info(f"Created fairness assessment {assessment.id}")
        return assessment
    
    def get_assessment(self, db: Session, assessment_id: UUID) -> Optional[FairnessAssessment]:
        """Get a fairness assessment by ID."""
        return db.query(FairnessAssessment).filter(FairnessAssessment.id == assessment_id).first()
    
    def get_assessments(
        self,
        db: Session,
        user_id: Optional[UUID] = None,
        organization_id: Optional[UUID] = None,
        status: Optional[FairnessAssessmentStatus] = None,
        skip: int = 0,
        limit: int = 100,
        sort_by: str = "created_at",
        sort_desc: bool = True
    ) -> List[FairnessAssessment]:
        """Get fairness assessments with filtering."""
        query = db.query(FairnessAssessment)
        
        if user_id:
            query = query.filter(FairnessAssessment.created_by == user_id)
        if organization_id:
            query = query.filter(FairnessAssessment.organization_id == organization_id)
        if status:
            query = query.filter(FairnessAssessment.status == status)
        
        if sort_desc:
            query = query.order_by(desc(getattr(FairnessAssessment, sort_by)))
        else:
            query = query.order_by(getattr(FairnessAssessment, sort_by))
        
        return query.offset(skip).limit(limit).all()
    
    def count_assessments(
        self,
        db: Session,
        user_id: Optional[UUID] = None,
        organization_id: Optional[UUID] = None,
        status: Optional[FairnessAssessmentStatus] = None
    ) -> int:
        """Count fairness assessments."""
        query = db.query(FairnessAssessment)
        
        if user_id:
            query = query.filter(FairnessAssessment.created_by == user_id)
        if organization_id:
            query = query.filter(FairnessAssessment.organization_id == organization_id)
        if status:
            query = query.filter(FairnessAssessment.status == status)
        
        return query.count()
    
    def update_assessment(self, db: Session, assessment_id: UUID, assessment_data: FairnessAssessmentUpdate) -> Optional[FairnessAssessment]:
        """Update a fairness assessment."""
        assessment = db.query(FairnessAssessment).filter(FairnessAssessment.id == assessment_id).first()
        if not assessment:
            return None
        
        # Only allow updates if assessment is not running
        if assessment.status not in [FairnessAssessmentStatus.RUNNING, FairnessAssessmentStatus.COMPLETED]:
            update_data = assessment_data.dict(exclude_unset=True)
            
            # Convert Pydantic models to JSON for protected attributes and thresholds
            if 'protected_attributes' in update_data:
                update_data['protected_attributes'] = [attr.dict() for attr in update_data['protected_attributes']]
            if 'fairness_thresholds' in update_data:
                update_data['fairness_thresholds'] = [threshold.dict() for threshold in update_data['fairness_thresholds']]
            
            for field, value in update_data.items():
                setattr(assessment, field, value)
            
            db.commit()
            db.refresh(assessment)
            
            logger.info(f"Updated fairness assessment {assessment_id}")
        
        return assessment
    
    def delete_assessment(self, db: Session, assessment_id: UUID) -> bool:
        """Delete a fairness assessment."""
        assessment = db.query(FairnessAssessment).filter(FairnessAssessment.id == assessment_id).first()
        if not assessment:
            return False
        
        # Cancel execution job if running
        if assessment.execution_job_id:
            try:
                self.job_service.cancel_job(db, assessment.execution_job_id)
            except Exception as e:
                logger.warning(f"Failed to cancel execution job for assessment {assessment_id}: {e}")
        
        db.delete(assessment)
        db.commit()
        
        logger.info(f"Deleted fairness assessment {assessment_id}")
        return True
    
    def execute_assessment(self, db: Session, execution_request: FairnessAssessmentExecutionRequest, user_id: UUID, organization_id: UUID) -> FairnessAssessment:
        """Execute a fairness assessment."""
        assessment = self.get_assessment(db, execution_request.assessment_id)
        if not assessment:
            raise ValueError(f"Assessment {execution_request.assessment_id} not found")
        
        if assessment.status == FairnessAssessmentStatus.RUNNING:
            raise ValueError("Assessment is already running")
        
        # Prepare job parameters
        job_parameters = {
            "assessment_id": str(execution_request.assessment_id),
            "assessment_type": "fairness",
            "model_name": assessment.model_name,
            "model_version": assessment.model_version,
            "protected_attributes": assessment.protected_attributes,
            "target_column": assessment.target_column,
            "fairness_thresholds": assessment.fairness_thresholds,
            "data_source_id": str(assessment.data_source_id) if assessment.data_source_id else None,
            "data_query": assessment.data_query,
            "test_size": assessment.test_size,
            "random_seed": assessment.random_seed,
            "confidence_level": assessment.confidence_level,
            "notebook_template": assessment.notebook_template
        }
        
        # Add custom notebook parameters
        if execution_request.notebook_parameters:
            job_parameters.update(execution_request.notebook_parameters)
        
        # Create job submission request
        from app.schemas.job import JobSubmissionRequest
        job_request = JobSubmissionRequest(
            job_type=JobType.ASSESSMENT,
            name=f"Fairness Assessment: {assessment.name}",
            description=f"Executing fairness assessment for model {assessment.model_name}",
            parameters=job_parameters,
            priority=execution_request.priority,
            tags=["fairness", "assessment", assessment.model_name]
        )
        
        # Submit job
        job = self.job_service.submit_job(db, job_request, user_id, organization_id)
        
        # Update assessment with job reference
        assessment.execution_job_id = job.id
        assessment.status = FairnessAssessmentStatus.RUNNING
        assessment.started_at = datetime.utcnow()
        db.commit()
        db.refresh(assessment)
        
        logger.info(f"Started fairness assessment {assessment_id} with job {job.id}")
        return assessment
    
    def wizard_step_validation(self, wizard_data: FairnessAssessmentConfigurationWizard) -> List[str]:
        """Validate configuration wizard data for current step."""
        errors = []
        
        if wizard_data.step == 1:
            # Model Information validation
            if not wizard_data.model_name:
                errors.append("Model name is required")
            if not wizard_data.target_column:
                errors.append("Target column is required")
        
        elif wizard_data.step == 2:
            # Data Source validation
            if not wizard_data.data_source_id and not wizard_data.data_query:
                errors.append("Either data source or data query is required")
        
        elif wizard_data.step == 3:
            # Protected Attributes validation
            if not wizard_data.protected_attributes:
                errors.append("At least one protected attribute is required")
            else:
                for attr in wizard_data.protected_attributes:
                    if not attr.privileged_groups:
                        errors.append(f"Privileged groups required for {attr.name}")
                    if not attr.unprivileged_groups:
                        errors.append(f"Unprivileged groups required for {attr.name}")
        
        elif wizard_data.step == 4:
            # Fairness Thresholds validation
            if not wizard_data.fairness_thresholds:
                errors.append("At least one fairness threshold is required")
            else:
                for threshold in wizard_data.fairness_thresholds:
                    if threshold.threshold_value < 0 or threshold.threshold_value > 1:
                        errors.append(f"Threshold value must be between 0 and 1 for {threshold.metric_type}")
        
        return errors
    
    def process_wizard_step(self, db: Session, wizard_data: FairnessAssessmentConfigurationWizard, user_id: UUID, organization_id: UUID, session_data: Dict[str, Any]) -> FairnessAssessmentWizardResponse:
        """Process a step in the configuration wizard."""
        # Validate current step
        errors = self.wizard_step_validation(wizard_data)
        
        # Update session data with current step information
        step_data = {
            "model_name": wizard_data.model_name,
            "model_version": wizard_data.model_version,
            "target_column": wizard_data.target_column,
            "data_source_id": wizard_data.data_source_id,
            "data_query": wizard_data.data_query,
            "protected_attributes": [attr.dict() for attr in wizard_data.protected_attributes] if wizard_data.protected_attributes else [],
            "fairness_thresholds": [threshold.dict() for threshold in wizard_data.fairness_thresholds] if wizard_data.fairness_thresholds else [],
            "test_size": wizard_data.test_size,
            "random_seed": wizard_data.random_seed,
            "confidence_level": wizard_data.confidence_level,
            "notebook_template": wizard_data.notebook_template
        }
        
        session_data[f"step_{wizard_data.step}"] = step_data
        
        # Determine if we can move to next step
        can_advance = len(errors) == 0 and wizard_data.step < 5
        can_go_back = wizard_data.step > 1
        
        # If this is the final step and validation passes, create the assessment
        if wizard_data.step == 5 and len(errors) == 0:
            # Combine all step data
            assessment_data = {}
            for i in range(1, 6):
                if f"step_{i}" in session_data:
                    assessment_data.update(session_data[f"step_{i}"])
            
            # Create the assessment
            from app.schemas.fairness_assessment import FairnessAssessmentCreate, ProtectedAttributeConfig, FairnessThresholdConfig
            
            create_data = FairnessAssessmentCreate(
                name=f"Fairness Assessment - {assessment_data['model_name']}",
                model_name=assessment_data['model_name'],
                model_version=assessment_data.get('model_version'),
                target_column=assessment_data['target_column'],
                data_source_id=assessment_data.get('data_source_id'),
                data_query=assessment_data.get('data_query'),
                test_size=assessment_data.get('test_size', 0.2),
                random_seed=assessment_data.get('random_seed'),
                confidence_level=assessment_data.get('confidence_level', 0.95),
                notebook_template=assessment_data.get('notebook_template', 'veritas_fairness'),
                protected_attributes=[ProtectedAttributeConfig(**attr) for attr in assessment_data['protected_attributes']],
                fairness_thresholds=[FairnessThresholdConfig(**threshold) for threshold in assessment_data['fairness_thresholds']]
            )
            
            assessment = self.create_assessment(db, create_data, user_id, organization_id)
            
            return FairnessAssessmentWizardResponse(
                step=wizard_data.step,
                completed=True,
                validation_errors=errors,
                next_step_available=False,
                prev_step_available=can_go_back,
                current_configuration={"assessment_id": str(assessment.id)}
            )
        
        return FairnessAssessmentWizardResponse(
            step=wizard_data.step,
            completed=wizard_data.step == 5 and len(errors) == 0,
            validation_errors=errors,
            next_step_available=can_advance,
            prev_step_available=can_go_back,
            current_configuration=step_data
        )
    
    def generate_report(self, db: Session, report_request: FairnessReportRequest) -> FairnessReport:
        """Generate a fairness report."""
        assessment = self.get_assessment(db, report_request.assessment_id)
        if not assessment:
            raise ValueError(f"Assessment {report_request.assessment_id} not found")
        
        if not assessment.is_completed:
            raise ValueError("Assessment must be completed before generating report")
        
        # Calculate report data
        metrics = db.query(FairnessAssessmentMetric).filter(FairnessAssessmentMetric.assessment_id == assessment.id).all()
        
        # Generate summary findings
        passed_metrics = sum(1 for metric in metrics if metric.passed)
        total_metrics = len(metrics)
        pass_rate = passed_metrics / total_metrics if total_metrics > 0 else 0
        
        # Generate recommendations based on failed metrics
        failed_metrics = [metric for metric in metrics if not metric.passed]
        recommendations = self._generate_recommendations(failed_metrics)
        
        # Risk assessment
        risk_level = self._calculate_risk_level(pass_rate, assessment.overall_fairness_score)
        
        # Create report
        report = FairnessReport(
            assessment_id=assessment.id,
            report_type=report_request.report_type,
            title=report_request.title or f"Fairness Assessment Report - {assessment.model_name}",
            subtitle=f"Assessment conducted on {assessment.created_at.strftime('%Y-%m-%d')}",
            summary_findings={
                "total_metrics": total_metrics,
                "passed_metrics": passed_metrics,
                "failed_metrics": total_metrics - passed_metrics,
                "pass_rate": pass_rate,
                "overall_fairness_score": assessment.overall_fairness_score
            },
            recommendations=recommendations if report_request.include_recommendations else [],
            risk_assessment={
                "risk_level": risk_level,
                "pass_rate": pass_rate,
                "failed_metrics_count": total_metrics - passed_metrics,
                "critical_failures": len([m for m in failed_metrics if m.metric_type in [FairnessMetricType.DEMOGRAPHIC_PARITY, FairnessMetricType.EQUAL_OPPORTUNITY]])
            } if report_request.include_risk_assessment else {},
            charts=self._generate_chart_configurations(metrics, assessment),
            dashboard_config=self._generate_dashboard_config(assessment, metrics),
            generated_by="auto"
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        # TODO: Generate actual report files (PDF, HTML, etc.)
        # This would involve using a report generation service
        
        logger.info(f"Generated fairness report {report.id} for assessment {assessment.id}")
        return report
    
    def _generate_recommendations(self, failed_metrics: List[FairnessAssessmentMetric]) -> List[Dict[str, Any]]:
        """Generate recommendations based on failed metrics."""
        recommendations = []
        
        for metric in failed_metrics:
            if metric.metric_type == FairnessMetricType.DEMOGRAPHIC_PARITY:
                recommendations.append({
                    "type": "data_preprocessing",
                    "priority": "high",
                    "title": "Address Demographic Parity Issues",
                    "description": f"Consider re-sampling techniques or bias mitigation algorithms for {metric.protected_attribute}",
                    "metric": metric.metric_name
                })
            elif metric.metric_type == FairnessMetricType.EQUAL_OPPORTUNITY:
                recommendations.append({
                    "type": "model_adjustment",
                    "priority": "high",
                    "title": "Improve Equal Opportunity",
                    "description": f"Adjust model thresholds or use fairness-aware learning algorithms for {metric.protected_attribute}",
                    "metric": metric.metric_name
                })
            elif metric.metric_type == FairnessMetricType.PREDICTIVE_PARITY:
                recommendations.append({
                    "type": "calibration",
                    "priority": "medium",
                    "title": "Calibration Needed",
                    "description": f"Consider calibrating model predictions for different groups of {metric.protected_attribute}",
                    "metric": metric.metric_name
                })
        
        return recommendations
    
    def _calculate_risk_level(self, pass_rate: float, fairness_score: Optional[float]) -> str:
        """Calculate risk level based on pass rate and fairness score."""
        if fairness_score is None:
            fairness_score = pass_rate
        
        if fairness_score >= 0.9:
            return "low"
        elif fairness_score >= 0.7:
            return "medium"
        else:
            return "high"
    
    def _generate_chart_configurations(self, metrics: List[FairnessAssessmentMetric], assessment: FairnessAssessment) -> List[Dict[str, Any]]:
        """Generate chart configurations for visualizations."""
        charts = []
        
        # Pass/Fail pie chart
        passed_count = sum(1 for metric in metrics if metric.passed)
        failed_count = len(metrics) - passed_count
        
        charts.append({
            "type": "pie",
            "title": "Metric Pass/Fail Distribution",
            "data": {
                "labels": ["Passed", "Failed"],
                "values": [passed_count, failed_count],
                "colors": ["#10B981", "#EF4444"]
            }
        })
        
        # Fairness scores by metric type
        metric_type_scores = {}
        for metric in metrics:
            metric_type = metric.metric_type.value
            if metric_type not in metric_type_scores:
                metric_type_scores[metric_type] = []
            metric_type_scores[metric_type].append(metric.metric_value)
        
        avg_scores = {
            metric_type: np.mean(scores)
            for metric_type, scores in metric_type_scores.items()
        }
        
        charts.append({
            "type": "bar",
            "title": "Average Fairness Scores by Metric Type",
            "data": {
                "labels": list(avg_scores.keys()),
                "values": list(avg_scores.values()),
                "colors": ["#3B82F6"] * len(avg_scores)
            }
        })
        
        return charts
    
    def _generate_dashboard_config(self, assessment: FairnessAssessment, metrics: List[FairnessAssessmentMetric]) -> Dict[str, Any]:
        """Generate dashboard configuration."""
        return {
            "layout": "grid",
            "widgets": [
                {
                    "type": "metric_card",
                    "title": "Overall Fairness Score",
                    "value": assessment.overall_fairness_score or 0,
                    "format": "percentage"
                },
                {
                    "type": "metric_card",
                    "title": "Pass Rate",
                    "value": sum(1 for metric in metrics if metric.passed) / len(metrics) if metrics else 0,
                    "format": "percentage"
                },
                {
                    "type": "metric_card",
                    "title": "Total Metrics",
                    "value": len(metrics),
                    "format": "number"
                },
                {
                    "type": "chart",
                    "title": "Fairness Metrics Overview",
                    "chart_type": "bar"
                }
            ]
        }
    
    def get_assessment_statistics(self, db: Session, organization_id: Optional[UUID] = None) -> Dict[str, Any]:
        """Get fairness assessment statistics."""
        query = db.query(FairnessAssessment)
        if organization_id:
            query = query.filter(FairnessAssessment.organization_id == organization_id)
        
        total_assessments = query.count()
        
        status_counts = {}
        for status in FairnessAssessmentStatus:
            status_counts[status.value] = query.filter(FairnessAssessment.status == status).count()
        
        # Average fairness score for completed assessments
        completed_assessments = query.filter(FairnessAssessment.status == FairnessAssessmentStatus.COMPLETED).all()
        avg_fairness_score = None
        if completed_assessments:
            scores = [assessment.overall_fairness_score for assessment in completed_assessments if assessment.overall_fairness_score]
            if scores:
                avg_fairness_score = sum(scores) / len(scores)
        
        return {
            "total_assessments": total_assessments,
            "status_counts": status_counts,
            "average_fairness_score": avg_fairness_score
        }


# Create service instance
fairness_assessment_service = FairnessAssessmentService()