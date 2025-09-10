from typing import List, Optional, Dict, Any, Union
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from app.models.diagnosis_assessment import (
    DiagnosisAssessment, 
    DiagnosisMetric, 
    DriftDetection, 
    ExplainabilityResult, 
    DiagnosisReport,
    InferenceMonitoring,
    DiagnosisAssessmentStatus,
    DiagnosisMetricType,
    DriftDetectionType,
    ExplainabilityMethod
)
from app.models.job import Job, JobType, JobStatus
from app.models.model_card import ModelCard
from app.models.data_source import DataSource
from app.schemas.diagnosis_assessment import (
    DiagnosisAssessmentCreate,
    DiagnosisAssessmentUpdate,
    DiagnosisAssessmentExecutionRequest,
    DiagnosisAssessmentConfigurationWizard,
    DiagnosisAssessmentWizardResponse,
    DiagnosisReportRequest,
    DiagnosisTemplate,
    DiagnosisStatistics
)
from app.core.database import get_db
from app.services.job_service import JobService
import structlog
import json

logger = structlog.get_logger()

class DiagnosisAssessmentService:
    def __init__(self):
        self.job_service = JobService()
        
    def create_assessment(self, db: Session, assessment_data: DiagnosisAssessmentCreate, user_id: UUID, organization_id: UUID) -> DiagnosisAssessment:
        """Create a new diagnosis assessment."""
        try:
            # Create assessment
            assessment = DiagnosisAssessment(
                name=assessment_data.name,
                description=assessment_data.description,
                model_name=assessment_data.model_name,
                model_version=assessment_data.model_version,
                model_id=assessment_data.model_id,
                diagnosis_types=assessment_data.diagnosis_types,
                performance_metrics=assessment_data.performance_metrics,
                drift_detection_config=assessment_data.drift_detection_config,
                explainability_config=assessment_data.explainability_config,
                data_source_id=assessment_data.data_source_id,
                baseline_data_source_id=assessment_data.baseline_data_source_id,
                data_query=assessment_data.data_query,
                test_size=assessment_data.test_size,
                random_seed=assessment_data.random_seed,
                confidence_level=assessment_data.confidence_level,
                drift_threshold=assessment_data.drift_threshold,
                drift_significance_level=assessment_data.drift_significance_level,
                explainability_samples=assessment_data.explainability_samples,
                explainability_background_size=assessment_data.explainability_background_size,
                notebook_template=assessment_data.notebook_template,
                notebook_parameters=assessment_data.notebook_parameters,
                created_by=user_id,
                organization_id=organization_id
            )
            
            db.add(assessment)
            db.commit()
            db.refresh(assessment)
            
            logger.info(f"Created diagnosis assessment {assessment.id}", assessment_id=assessment.id)
            return assessment
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create diagnosis assessment: {e}", exc_info=True)
            raise
    
    def get_assessment(self, db: Session, assessment_id: UUID) -> Optional[DiagnosisAssessment]:
        """Get a diagnosis assessment by ID."""
        return db.query(DiagnosisAssessment).filter(DiagnosisAssessment.id == assessment_id).first()
    
    def get_assessments(self, db: Session, user_id: UUID, organization_id: UUID, 
                       status: Optional[DiagnosisAssessmentStatus] = None,
                       skip: int = 0, limit: int = 100,
                       sort_by: str = "created_at", sort_desc: bool = True) -> List[DiagnosisAssessment]:
        """Get diagnosis assessments with filtering and pagination."""
        query = db.query(DiagnosisAssessment).filter(
            or_(DiagnosisAssessment.created_by == user_id, 
                DiagnosisAssessment.organization_id == organization_id)
        )
        
        if status:
            query = query.filter(DiagnosisAssessment.status == status)
        
        # Sorting
        if sort_desc:
            query = query.order_by(desc(getattr(DiagnosisAssessment, sort_by)))
        else:
            query = query.order_by(getattr(DiagnosisAssessment, sort_by))
        
        return query.offset(skip).limit(limit).all()
    
    def count_assessments(self, db: Session, user_id: UUID, organization_id: UUID, 
                          status: Optional[DiagnosisAssessmentStatus] = None) -> int:
        """Count diagnosis assessments with filtering."""
        query = db.query(DiagnosisAssessment).filter(
            or_(DiagnosisAssessment.created_by == user_id, 
                DiagnosisAssessment.organization_id == organization_id)
        )
        
        if status:
            query = query.filter(DiagnosisAssessment.status == status)
        
        return query.count()
    
    def update_assessment(self, db: Session, assessment_id: UUID, 
                         assessment_data: DiagnosisAssessmentUpdate) -> Optional[DiagnosisAssessment]:
        """Update a diagnosis assessment."""
        try:
            assessment = self.get_assessment(db, assessment_id)
            if not assessment:
                return None
            
            # Check if assessment can be updated
            if assessment.status not in [DiagnosisAssessmentStatus.PENDING, DiagnosisAssessmentStatus.CONFIGURING]:
                raise ValueError(f"Cannot update assessment in {assessment.status} status")
            
            # Update fields
            update_data = assessment_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(assessment, field, value)
            
            db.commit()
            db.refresh(assessment)
            
            logger.info(f"Updated diagnosis assessment {assessment_id}", assessment_id=assessment_id)
            return assessment
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update diagnosis assessment {assessment_id}: {e}", exc_info=True)
            raise
    
    def delete_assessment(self, db: Session, assessment_id: UUID) -> bool:
        """Delete a diagnosis assessment."""
        try:
            assessment = self.get_assessment(db, assessment_id)
            if not assessment:
                return False
            
            # Check if assessment can be deleted
            if assessment.status == DiagnosisAssessmentStatus.RUNNING:
                raise ValueError("Cannot delete running assessment")
            
            db.delete(assessment)
            db.commit()
            
            logger.info(f"Deleted diagnosis assessment {assessment_id}", assessment_id=assessment_id)
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete diagnosis assessment {assessment_id}: {e}", exc_info=True)
            raise
    
    def execute_assessment(self, db: Session, execution_request: DiagnosisAssessmentExecutionRequest, 
                          user_id: UUID, organization_id: UUID) -> DiagnosisAssessment:
        """Execute a diagnosis assessment."""
        try:
            assessment = self.get_assessment(db, execution_request.assessment_id)
            if not assessment:
                raise ValueError("Assessment not found")
            
            # Check if assessment can be executed
            if assessment.status != DiagnosisAssessmentStatus.PENDING:
                raise ValueError(f"Cannot execute assessment in {assessment.status} status")
            
            # Validate configuration
            self._validate_assessment_config(assessment)
            
            # Create job for execution
            job_parameters = {
                "assessment_id": str(assessment.id),
                "diagnosis_types": assessment.diagnosis_types,
                "performance_metrics": assessment.performance_metrics,
                "drift_detection_config": assessment.drift_detection_config,
                "explainability_config": assessment.explainability_config,
                "data_source_id": str(assessment.data_source_id) if assessment.data_source_id else None,
                "baseline_data_source_id": str(assessment.baseline_data_source_id) if assessment.baseline_data_source_id else None,
                "data_query": assessment.data_query,
                "test_size": assessment.test_size,
                "random_seed": assessment.random_seed,
                "confidence_level": assessment.confidence_level,
                "drift_threshold": assessment.drift_threshold,
                "drift_significance_level": assessment.drift_significance_level,
                "explainability_samples": assessment.explainability_samples,
                "explainability_background_size": assessment.explainability_background_size,
                "notebook_template": assessment.notebook_template,
                "notebook_parameters": assessment.notebook_parameters or {}
            }
            
            # Add execution parameters if provided
            if execution_request.execution_parameters:
                job_parameters.update(execution_request.execution_parameters)
            
            job = self.job_service.create_job(
                db=db,
                job_type=JobType.ASSESSMENT,
                name=f"Diagnosis Assessment: {assessment.name}",
                description=f"Executing diagnosis assessment for model {assessment.model_name}",
                parameters=job_parameters,
                user_id=user_id,
                organization_id=organization_id,
                priority=execution_request.priority,
                max_retries=execution_request.max_retries
            )
            
            # Update assessment
            assessment.status = DiagnosisAssessmentStatus.RUNNING
            assessment.execution_job_id = job.id
            assessment.started_at = datetime.utcnow()
            
            db.commit()
            db.refresh(assessment)
            
            logger.info(f"Started execution of diagnosis assessment {assessment_id}", 
                       assessment_id=assessment_id, job_id=job.id)
            
            return assessment
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to execute diagnosis assessment {assessment_id}: {e}", exc_info=True)
            raise
    
    def process_wizard_step(self, db: Session, wizard_data: DiagnosisAssessmentConfigurationWizard, 
                           user_id: UUID, organization_id: UUID, session_data: Dict[str, Any]) -> DiagnosisAssessmentWizardResponse:
        """Process a step in the diagnosis assessment configuration wizard."""
        try:
            step = wizard_data.step
            action = wizard_data.action
            
            # Update session data with current form data
            form_data = session_data.get("form_data", {})
            current_data = wizard_data.dict(exclude={"step", "action", "assessment_id"})
            form_data.update({k: v for k, v in current_data.items() if v is not None})
            
            session_data["form_data"] = form_data
            
            # Validate current step
            validation_errors = self._validate_wizard_step(step, form_data)
            
            response = DiagnosisAssessmentWizardResponse(
                step=step,
                assessment_id=session_data.get("assessment_id"),
                completed=False,
                form_data=form_data,
                validation_errors=validation_errors,
                can_proceed=len(validation_errors) == 0
            )
            
            # Handle wizard actions
            if action == "next" and len(validation_errors) == 0:
                if step < 5:
                    response.next_step = step + 1
                    response.step = step + 1
                else:
                    # Complete wizard
                    assessment = self._create_assessment_from_wizard(db, form_data, user_id, organization_id)
                    response.assessment_id = assessment.id
                    response.completed = True
                    response.step = 5
                    
            elif action == "previous" and step > 1:
                response.next_step = step - 1
                response.step = step - 1
                
            elif action == "save":
                if session_data.get("assessment_id"):
                    # Update existing assessment
                    assessment = self.update_assessment(db, session_data["assessment_id"], 
                                                       DiagnosisAssessmentUpdate(**form_data))
                else:
                    # Create new assessment
                    assessment = self._create_assessment_from_wizard(db, form_data, user_id, organization_id)
                    session_data["assessment_id"] = assessment.id
                    response.assessment_id = assessment.id
                    
            elif action == "execute" and len(validation_errors) == 0:
                if not session_data.get("assessment_id"):
                    assessment = self._create_assessment_from_wizard(db, form_data, user_id, organization_id)
                    session_data["assessment_id"] = assessment.id
                    response.assessment_id = assessment.id
                
                # Execute assessment
                execution_request = DiagnosisAssessmentExecutionRequest(
                    assessment_id=session_data["assessment_id"]
                )
                self.execute_assessment(db, execution_request, user_id, organization_id)
                response.completed = True
            
            # Generate preview data
            response.preview_data = self._generate_wizard_preview(form_data)
            
            return response
            
        except Exception as e:
            logger.error(f"Failed to process wizard step {step}: {e}", exc_info=True)
            raise
    
    def generate_report(self, db: Session, report_request: DiagnosisReportRequest) -> DiagnosisReport:
        """Generate a diagnosis assessment report."""
        try:
            assessment = self.get_assessment(db, report_request.assessment_id)
            if not assessment:
                raise ValueError("Assessment not found")
            
            # Check if assessment is completed
            if assessment.status != DiagnosisAssessmentStatus.COMPLETED:
                raise ValueError("Assessment must be completed before generating report")
            
            # Create report
            report = DiagnosisReport(
                assessment_id=assessment.id,
                report_type=report_request.report_type,
                title=report_request.title or f"Diagnosis Report: {assessment.name}",
                subtitle=f"Model: {assessment.model_name} v{assessment.model_version or 'latest'}",
                generated_by="auto",
                template_version=report_request.template_version or "1.0.0"
            )
            
            # Generate report content
            report_content = self._generate_report_content(db, assessment, report_request)
            report.executive_summary = report_content["executive_summary"]
            report.technical_summary = report_content["technical_summary"]
            report.key_findings = report_content["key_findings"]
            report.recommendations = report_content["recommendations"]
            report.risk_assessment = report_content["risk_assessment"]
            
            # Generate visualization data
            if report_request.include_charts:
                visualization_data = self._generate_visualization_data(db, assessment)
                report.charts = visualization_data["charts"]
                report.dashboard_config = visualization_data["dashboard_config"]
            
            # Generate model card updates
            model_card_updates = self._generate_model_card_updates(assessment)
            report.model_card_updates = model_card_updates
            
            db.add(report)
            db.commit()
            db.refresh(report)
            
            # Update assessment
            assessment.report_generated = True
            assessment.report_url = f"/api/v1/diagnosis/reports/{report.id}/download"
            assessment.executive_summary = report.executive_summary
            assessment.technical_summary = report.technical_summary
            
            db.commit()
            
            logger.info(f"Generated diagnosis report {report.id} for assessment {assessment.id}", 
                       report_id=report.id, assessment_id=assessment.id)
            
            return report
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to generate diagnosis report: {e}", exc_info=True)
            raise
    
    def get_assessment_statistics(self, db: Session, organization_id: UUID) -> DiagnosisStatistics:
        """Get diagnosis assessment statistics."""
        try:
            # Basic counts
            total_assessments = db.query(DiagnosisAssessment).filter(
                DiagnosisAssessment.organization_id == organization_id
            ).count()
            
            completed_assessments = db.query(DiagnosisAssessment).filter(
                and_(
                    DiagnosisAssessment.organization_id == organization_id,
                    DiagnosisAssessment.status == DiagnosisAssessmentStatus.COMPLETED
                )
            ).count()
            
            failed_assessments = db.query(DiagnosisAssessment).filter(
                and_(
                    DiagnosisAssessment.organization_id == organization_id,
                    DiagnosisAssessment.status == DiagnosisAssessmentStatus.FAILED
                )
            ).count()
            
            # Average performance score
            avg_score = db.query(func.avg(DiagnosisAssessment.overall_performance_score)).filter(
                and_(
                    DiagnosisAssessment.organization_id == organization_id,
                    DiagnosisAssessment.status == DiagnosisAssessmentStatus.COMPLETED,
                    DiagnosisAssessment.overall_performance_score.isnot(None)
                )
            ).scalar()
            
            # Assessments with drift
            drift_assessments = db.query(DiagnosisAssessment).filter(
                and_(
                    DiagnosisAssessment.organization_id == organization_id,
                    DiagnosisAssessment.drift_detected == True
                )
            ).count()
            
            # Average duration
            avg_duration = db.query(func.avg(
                func.extract('epoch', DiagnosisAssessment.completed_at - DiagnosisAssessment.started_at)
            )).filter(
                and_(
                    DiagnosisAssessment.organization_id == organization_id,
                    DiagnosisAssessment.status == DiagnosisAssessmentStatus.COMPLETED,
                    DiagnosisAssessment.started_at.isnot(None),
                    DiagnosisAssessment.completed_at.isnot(None)
                )
            ).scalar()
            
            # Popular diagnosis types
            diagnosis_types = []
            if total_assessments > 0:
                # Count diagnosis types
                type_counts = {}
                assessments = db.query(DiagnosisAssessment).filter(
                    DiagnosisAssessment.organization_id == organization_id
                ).all()
                
                for assessment in assessments:
                    for diagnosis_type in assessment.diagnosis_types or []:
                        type_counts[diagnosis_type] = type_counts.get(diagnosis_type, 0) + 1
                
                # Get top 5
                sorted_types = sorted(type_counts.items(), key=lambda x: x[1], reverse=True)
                diagnosis_types = [t[0] for t in sorted_types[:5]]
            
            # Recent assessments
            recent_assessments = db.query(DiagnosisAssessment).filter(
                DiagnosisAssessment.organization_id == organization_id
            ).order_by(desc(DiagnosisAssessment.created_at)).limit(5).all()
            
            return DiagnosisStatistics(
                total_assessments=total_assessments,
                completed_assessments=completed_assessments,
                failed_assessments=failed_assessments,
                average_performance_score=avg_score,
                assessments_with_drift=drift_assessments,
                average_duration=avg_duration,
                popular_diagnosis_types=diagnosis_types,
                recent_assessments=recent_assessments
            )
            
        except Exception as e:
            logger.error(f"Failed to get diagnosis assessment statistics: {e}", exc_info=True)
            raise
    
    def get_templates(self) -> List[DiagnosisTemplate]:
        """Get available diagnosis assessment templates."""
        return [
            DiagnosisTemplate(
                id="veritas_comprehensive",
                name="Veritas Comprehensive Diagnosis",
                description="Comprehensive diagnosis including performance, drift, and explainability analysis",
                diagnosis_types=["performance", "drift_detection", "explainability"],
                performance_metrics=["accuracy", "precision", "recall", "f1_score", "auc_roc"],
                drift_detection_methods=["psi", "kl_divergence", "kolmogorov_smirnov"],
                explainability_methods=["shap", "lime", "feature_importance"],
                notebook_template="veritas_comprehensive_diagnosis_template.ipynb",
                configuration={
                    "default_test_size": 0.2,
                    "default_confidence_level": 0.95,
                    "default_drift_threshold": 0.1,
                    "default_explainability_samples": 1000
                }
            ),
            DiagnosisTemplate(
                id="performance_only",
                name="Performance Analysis",
                description="Focus on performance metrics and model evaluation",
                diagnosis_types=["performance"],
                performance_metrics=["accuracy", "precision", "recall", "f1_score", "auc_roc"],
                drift_detection_methods=[],
                explainability_methods=[],
                notebook_template="performance_analysis_template.ipynb",
                configuration={
                    "default_test_size": 0.2,
                    "default_confidence_level": 0.95
                }
            ),
            DiagnosisTemplate(
                id="drift_detection",
                name="Drift Detection",
                description="Focus on drift detection and data quality analysis",
                diagnosis_types=["drift_detection"],
                performance_metrics=[],
                drift_detection_methods=["psi", "kl_divergence", "kolmogorov_smirnov"],
                explainability_methods=[],
                notebook_template="drift_detection_template.ipynb",
                configuration={
                    "default_drift_threshold": 0.1,
                    "default_significance_level": 0.05
                }
            ),
            DiagnosisTemplate(
                id="explainability",
                name="Explainability Analysis",
                description="Focus on model explainability and interpretability",
                diagnosis_types=["explainability"],
                performance_metrics=[],
                drift_detection_methods=[],
                explainability_methods=["shap", "lime", "feature_importance", "pdp"],
                notebook_template="explainability_analysis_template.ipynb",
                configuration={
                    "default_explainability_samples": 1000,
                    "default_background_size": 100
                }
            )
        ]
    
    def _validate_assessment_config(self, assessment: DiagnosisAssessment) -> None:
        """Validate assessment configuration."""
        # Validate diagnosis types
        valid_types = ["performance", "drift_detection", "explainability"]
        for diagnosis_type in assessment.diagnosis_types or []:
            if diagnosis_type not in valid_types:
                raise ValueError(f"Invalid diagnosis type: {diagnosis_type}")
        
        # Validate data source
        if not assessment.data_source_id and not assessment.data_query:
            raise ValueError("Either data_source_id or data_query must be provided")
        
        # Validate drift detection configuration
        if "drift_detection" in (assessment.diagnosis_types or []):
            if not assessment.baseline_data_source_id:
                raise ValueError("Baseline data source is required for drift detection")
        
        # Validate notebook template
        if not assessment.notebook_template:
            raise ValueError("Notebook template is required")
    
    def _validate_wizard_step(self, step: int, form_data: Dict[str, Any]) -> List[str]:
        """Validate wizard step data."""
        errors = []
        
        if step == 1:
            if not form_data.get("name"):
                errors.append("Name is required")
            if not form_data.get("model_name"):
                errors.append("Model name is required")
                
        elif step == 2:
            if not form_data.get("diagnosis_types"):
                errors.append("At least one diagnosis type is required")
                
        elif step == 3:
            if not form_data.get("data_source_id") and not form_data.get("data_query"):
                errors.append("Either data source or data query is required")
                
        elif step == 4:
            diagnosis_types = form_data.get("diagnosis_types", [])
            if "drift_detection" in diagnosis_types and not form_data.get("baseline_data_source_id"):
                errors.append("Baseline data source is required for drift detection")
        
        return errors
    
    def _create_assessment_from_wizard(self, db: Session, form_data: Dict[str, Any], 
                                      user_id: UUID, organization_id: UUID) -> DiagnosisAssessment:
        """Create assessment from wizard form data."""
        assessment_data = DiagnosisAssessmentCreate(**form_data)
        return self.create_assessment(db, assessment_data, user_id, organization_id)
    
    def _generate_wizard_preview(self, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate wizard preview data."""
        return {
            "name": form_data.get("name"),
            "model_name": form_data.get("model_name"),
            "diagnosis_types": form_data.get("diagnosis_types", []),
            "data_source": form_data.get("data_source_id") or "Custom Query",
            "baseline_data_source": form_data.get("baseline_data_source_id"),
            "performance_metrics": form_data.get("performance_metrics", []),
            "test_size": form_data.get("test_size", 0.2),
            "confidence_level": form_data.get("confidence_level", 0.95)
        }
    
    def _generate_report_content(self, db: Session, assessment: DiagnosisAssessment, 
                                report_request: DiagnosisReportRequest) -> Dict[str, Any]:
        """Generate report content."""
        # Get metrics
        metrics = db.query(DiagnosisMetric).filter(
            DiagnosisMetric.assessment_id == assessment.id
        ).all()
        
        # Get drift results
        drift_results = db.query(DriftDetection).filter(
            DriftDetection.assessment_id == assessment.id
        ).all()
        
        # Get explainability results
        explainability_results = db.query(ExplainabilityResult).filter(
            ExplainabilityResult.assessment_id == assessment.id
        ).all()
        
        # Generate executive summary
        executive_summary = self._generate_executive_summary(assessment, metrics, drift_results, explainability_results)
        
        # Generate technical summary
        technical_summary = self._generate_technical_summary(assessment, metrics, drift_results, explainability_results)
        
        # Generate key findings
        key_findings = self._generate_key_findings(assessment, metrics, drift_results, explainability_results)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(assessment, metrics, drift_results, explainability_results)
        
        # Generate risk assessment
        risk_assessment = self._generate_risk_assessment(assessment, metrics, drift_results)
        
        return {
            "executive_summary": executive_summary,
            "technical_summary": technical_summary,
            "key_findings": key_findings,
            "recommendations": recommendations,
            "risk_assessment": risk_assessment
        }
    
    def _generate_executive_summary(self, assessment: DiagnosisAssessment, metrics: List[DiagnosisMetric], 
                                   drift_results: List[DriftDetection], explainability_results: List[ExplainabilityResult]) -> str:
        """Generate executive summary."""
        summary_parts = []
        
        summary_parts.append(f"This report presents the results of a comprehensive diagnosis assessment for {assessment.model_name} version {assessment.model_version or 'latest'}.")
        
        if assessment.overall_performance_score:
            summary_parts.append(f"The overall performance score is {assessment.overall_performance_score:.2f}.")
        
        if assessment.drift_detected:
            summary_parts.append("Data drift has been detected in the model's input distribution.")
        else:
            summary_parts.append("No significant data drift was detected.")
        
        # Add key insights
        passed_metrics = sum(1 for m in metrics if m.passed)
        total_metrics = len(metrics)
        if total_metrics > 0:
            summary_parts.append(f"{passed_metrics} out of {total_metrics} performance metrics met their thresholds.")
        
        return " ".join(summary_parts)
    
    def _generate_technical_summary(self, assessment: DiagnosisAssessment, metrics: List[DiagnosisMetric], 
                                   drift_results: List[DriftDetection], explainability_results: List[ExplainabilityResult]) -> str:
        """Generate technical summary."""
        summary_parts = []
        
        summary_parts.append(f"Technical analysis of {assessment.model_name} conducted on {assessment.created_at.date()}.")
        
        if metrics:
            summary_parts.append(f"Performance evaluation included {len(metrics)} metrics across different dataset types.")
        
        if drift_results:
            drift_detected = sum(1 for d in drift_results if d.drift_detected)
            summary_parts.append(f"Drift analysis examined {len(drift_results)} features, with {drift_detected} showing significant drift.")
        
        if explainability_results:
            methods_used = list(set(r.method.value for r in explainability_results))
            summary_parts.append(f"Explainability analysis utilized methods: {', '.join(methods_used)}.")
        
        return " ".join(summary_parts)
    
    def _generate_key_findings(self, assessment: DiagnosisAssessment, metrics: List[DiagnosisMetric], 
                              drift_results: List[DriftDetection], explainability_results: List[ExplainabilityResult]) -> List[Dict[str, Any]]:
        """Generate key findings."""
        findings = []
        
        # Performance findings
        if metrics:
            failed_metrics = [m for m in metrics if not m.passed]
            if failed_metrics:
                findings.append({
                    "category": "Performance",
                    "priority": "high",
                    "finding": f"{len(failed_metrics)} performance metrics failed to meet thresholds",
                    "details": [f"{m.metric_name}: {m.metric_value} (threshold: {m.threshold_min or m.threshold_max})" for m in failed_metrics]
                })
        
        # Drift findings
        if drift_results:
            drifted_features = [d for d in drift_results if d.drift_detected]
            if drifted_features:
                findings.append({
                    "category": "Data Drift",
                    "priority": "high" if any(d.drift_severity == "high" for d in drifted_features) else "medium",
                    "finding": f"Data drift detected in {len(drifted_features)} features",
                    "details": [f"{d.feature_name}: {d.drift_score:.3f} (threshold: {d.drift_threshold})" for d in drifted_features]
                })
        
        # Explainability findings
        if explainability_results:
            top_features = []
            for result in explainability_results:
                if result.feature_importance:
                    sorted_features = sorted(result.feature_importance.items(), key=lambda x: x[1], reverse=True)
                    top_features.extend([f"{name}: {score:.3f}" for name, score in sorted_features[:3]])
            
            if top_features:
                findings.append({
                    "category": "Explainability",
                    "priority": "medium",
                    "finding": "Key influential features identified",
                    "details": top_features[:5]  # Top 5 features
                })
        
        return findings
    
    def _generate_recommendations(self, assessment: DiagnosisAssessment, metrics: List[DiagnosisMetric], 
                                 drift_results: List[DriftDetection], explainability_results: List[ExplainabilityResult]) -> List[Dict[str, Any]]:
        """Generate recommendations."""
        recommendations = []
        
        # Performance recommendations
        failed_metrics = [m for m in metrics if not m.passed]
        for metric in failed_metrics:
            if metric.metric_type == DiagnosisMetricType.ACCURACY:
                recommendations.append({
                    "category": "Performance",
                    "priority": "high",
                    "recommendation": "Consider model retraining or hyperparameter tuning to improve accuracy",
                    "rationale": f"Current accuracy ({metric.metric_value}) is below acceptable threshold"
                })
        
        # Drift recommendations
        if drift_results:
            high_drift = [d for d in drift_results if d.drift_detected and d.drift_severity == "high"]
            if high_drift:
                recommendations.append({
                    "category": "Data Drift",
                    "priority": "high",
                    "recommendation": "Investigate data pipeline and consider retraining with recent data",
                    "rationale": f"High drift detected in {len(high_drift)} features"
                })
        
        # Explainability recommendations
        if explainability_results:
            recommendations.append({
                "category": "Explainability",
                "priority": "medium",
                "recommendation": "Document key feature influences and monitor for changes",
                "rationale": "Understanding feature importance helps maintain model interpretability"
            })
        
        return recommendations
    
    def _generate_risk_assessment(self, assessment: DiagnosisAssessment, metrics: List[DiagnosisMetric], 
                                 drift_results: List[DriftDetection]) -> Dict[str, Any]:
        """Generate risk assessment."""
        risk_factors = []
        overall_risk = "low"
        
        # Performance risk
        failed_metrics = [m for m in metrics if not m.passed]
        if failed_metrics:
            risk_level = "high" if len(failed_metrics) > 3 else "medium"
            risk_factors.append({
                "factor": "Performance",
                "level": risk_level,
                "description": f"{len(failed_metrics)} metrics failed to meet thresholds"
            })
        
        # Drift risk
        if drift_results:
            drift_detected = sum(1 for d in drift_results if d.drift_detected)
            if drift_detected > 0:
                risk_level = "high" if drift_detected > len(drift_results) * 0.3 else "medium"
                risk_factors.append({
                    "factor": "Data Drift",
                    "level": risk_level,
                    "description": f"Drift detected in {drift_detected} out of {len(drift_results)} features"
                })
        
        # Determine overall risk
        if any(f["level"] == "high" for f in risk_factors):
            overall_risk = "high"
        elif any(f["level"] == "medium" for f in risk_factors):
            overall_risk = "medium"
        
        return {
            "overall_risk": overall_risk,
            "risk_factors": risk_factors,
            "mitigation_suggestions": [
                "Monitor model performance regularly",
                "Set up alerts for drift detection",
                "Maintain model documentation",
                "Plan for model retraining"
            ]
        }
    
    def _generate_visualization_data(self, db: Session, assessment: DiagnosisAssessment) -> Dict[str, Any]:
        """Generate visualization data."""
        # This would generate data for various charts and visualizations
        # For now, return empty structure
        return {
            "charts": [],
            "dashboard_config": {}
        }
    
    def _generate_model_card_updates(self, assessment: DiagnosisAssessment) -> Dict[str, Any]:
        """Generate suggested model card updates."""
        updates = {}
        
        if assessment.overall_performance_score:
            updates["performance_score"] = assessment.overall_performance_score
        
        if assessment.drift_detected:
            updates["drift_status"] = "drift_detected"
        
        if assessment.executive_summary:
            updates["latest_assessment_summary"] = assessment.executive_summary
        
        return updates


# Create service instance
diagnosis_assessment_service = DiagnosisAssessmentService()