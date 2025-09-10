from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from uuid import UUID
from app.api.dependencies import get_db, get_current_user, get_current_organization
from app.models.user import User
from app.models.organization import Organization
from app.models.diagnosis_assessment import DiagnosisAssessmentStatus
from app.schemas.diagnosis_assessment import (
    DiagnosisAssessment,
    DiagnosisAssessmentCreate,
    DiagnosisAssessmentUpdate,
    DiagnosisAssessmentResponse,
    DiagnosisAssessmentListResponse,
    DiagnosisAssessmentExecutionRequest,
    DiagnosisAssessmentConfigurationWizard,
    DiagnosisAssessmentWizardResponse,
    DiagnosisReportRequest,
    DiagnosisReportResponse,
    DiagnosisTemplate,
    DiagnosisComparisonResponse,
    DiagnosisStatistics,
    DiagnosisMetricResponse,
    DriftDetectionResponse,
    ExplainabilityResultResponse,
    InferenceMonitoringConfig,
    InferenceMonitoringResponse
)
from app.services.diagnosis_assessment_service import DiagnosisAssessmentService
import structlog

logger = structlog.get_logger()

router = APIRouter()

@router.post("/diagnosis-assessments", response_model=DiagnosisAssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_diagnosis_assessment(
    assessment_data: DiagnosisAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Create a new diagnosis assessment."""
    try:
        service = DiagnosisAssessmentService()
        assessment = service.create_assessment(db, assessment_data, current_user.id, current_organization.id)
        return DiagnosisAssessmentResponse.from_orm(assessment)
    except Exception as e:
        logger.error(f"Failed to create diagnosis assessment: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create diagnosis assessment: {str(e)}"
        )

@router.get("/diagnosis-assessments", response_model=DiagnosisAssessmentListResponse)
def get_diagnosis_assessments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[DiagnosisAssessmentStatus] = Query(None, description="Filter by status"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_desc: bool = Query(True, description="Sort descending"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get diagnosis assessments with filtering and pagination."""
    try:
        service = DiagnosisAssessmentService()
        
        # Get assessments
        assessments = service.get_assessments(
            db=db,
            user_id=current_user.id,
            organization_id=current_organization.id,
            status=status,
            skip=skip,
            limit=limit,
            sort_by=sort_by,
            sort_desc=sort_desc
        )
        
        # Get total count
        total = service.count_assessments(
            db=db,
            user_id=current_user.id,
            organization_id=current_organization.id,
            status=status
        )
        
        # Convert to response format
        assessment_responses = [DiagnosisAssessmentResponse.from_orm(assessment) for assessment in assessments]
        
        return DiagnosisAssessmentListResponse(
            assessments=assessment_responses,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
    except Exception as e:
        logger.error(f"Failed to get diagnosis assessments: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get diagnosis assessments: {str(e)}"
        )

@router.get("/diagnosis-assessments/{assessment_id}", response_model=DiagnosisAssessmentResponse)
def get_diagnosis_assessment(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get a specific diagnosis assessment by ID."""
    try:
        service = DiagnosisAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis assessment not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id and assessment.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        return DiagnosisAssessmentResponse.from_orm(assessment)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get diagnosis assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get diagnosis assessment: {str(e)}"
        )

@router.put("/diagnosis-assessments/{assessment_id}", response_model=DiagnosisAssessmentResponse)
def update_diagnosis_assessment(
    assessment_id: UUID,
    assessment_data: DiagnosisAssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Update a diagnosis assessment."""
    try:
        service = DiagnosisAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis assessment not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        updated_assessment = service.update_assessment(db, assessment_id, assessment_data)
        if not updated_assessment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update assessment in current state"
            )
        
        return DiagnosisAssessmentResponse.from_orm(updated_assessment)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update diagnosis assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update diagnosis assessment: {str(e)}"
        )

@router.delete("/diagnosis-assessments/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_diagnosis_assessment(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Delete a diagnosis assessment."""
    try:
        service = DiagnosisAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis assessment not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        success = service.delete_assessment(db, assessment_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete assessment"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete diagnosis assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete diagnosis assessment: {str(e)}"
        )

@router.post("/diagnosis-assessments/{assessment_id}/execute", response_model=DiagnosisAssessmentResponse)
def execute_diagnosis_assessment(
    assessment_id: UUID,
    execution_request: DiagnosisAssessmentExecutionRequest = Body(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Execute a diagnosis assessment."""
    try:
        service = DiagnosisAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis assessment not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        # Use provided assessment_id if not in execution_request
        if execution_request is None:
            execution_request = DiagnosisAssessmentExecutionRequest(assessment_id=assessment_id)
        elif execution_request.assessment_id != assessment_id:
            execution_request.assessment_id = assessment_id
        
        executed_assessment = service.execute_assessment(db, execution_request, current_user.id, current_organization.id)
        return DiagnosisAssessmentResponse.from_orm(executed_assessment)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to execute diagnosis assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute diagnosis assessment: {str(e)}"
        )

@router.post("/diagnosis-assessments/wizard", response_model=DiagnosisAssessmentWizardResponse)
def process_wizard_step(
    wizard_data: DiagnosisAssessmentConfigurationWizard,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Process a step in the diagnosis assessment configuration wizard."""
    try:
        service = DiagnosisAssessmentService()
        
        # In a real implementation, you would store session data in a cache or session storage
        session_data = {}  # This would be retrieved from session storage
        
        response = service.process_wizard_step(db, wizard_data, current_user.id, current_organization.id, session_data)
        
        # Store updated session data (in a real implementation)
        # session_storage.update(session_data)
        
        return response
    except Exception as e:
        logger.error(f"Failed to process wizard step: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process wizard step: {str(e)}"
        )

@router.post("/diagnosis-assessments/{assessment_id}/reports", response_model=DiagnosisReportResponse)
def generate_diagnosis_report(
    assessment_id: UUID,
    report_request: DiagnosisReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Generate a diagnosis assessment report."""
    try:
        service = DiagnosisAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis assessment not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id and assessment.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        # Set assessment_id in report_request
        report_request.assessment_id = assessment_id
        
        report = service.generate_report(db, report_request)
        
        return DiagnosisReportResponse(
            report_id=report.id,
            report_url=report.report_url,
            data_export_url=report.data_export_url,
            visualizations_url=report.visualizations_url,
            status=report.report_status,
            estimated_completion_time=None
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to generate diagnosis report for assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate diagnosis report: {str(e)}"
        )

@router.get("/diagnosis-assessments/{assessment_id}/metrics")
def get_diagnosis_metrics(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get detailed diagnosis metrics for an assessment."""
    try:
        service = DiagnosisAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis assessment not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id and assessment.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        # Get metrics from the assessment
        metrics = []
        if hasattr(assessment, 'performance_metrics') and assessment.performance_metrics:
            for metric in assessment.performance_metrics:
                metrics.append(DiagnosisMetricResponse(
                    id=metric.id,
                    metric_name=metric.metric_name,
                    metric_type=metric.metric_type,
                    dataset_type=metric.dataset_type,
                    metric_value=float(metric.metric_value),
                    baseline_value=float(metric.baseline_value) if metric.baseline_value else None,
                    confidence_interval=metric.confidence_interval,
                    threshold_min=float(metric.threshold_min) if metric.threshold_min else None,
                    threshold_max=float(metric.threshold_max) if metric.threshold_max else None,
                    passed=metric.passed,
                    degradation_detected=metric.degradation_detected,
                    sample_size=metric.sample_size,
                    additional_metrics=metric.additional_metrics,
                    calculated_at=metric.calculated_at
                ))
        
        return {
            "assessment_id": assessment_id,
            "metrics": metrics,
            "overall_performance_score": assessment.overall_performance_score,
            "total_metrics": len(metrics),
            "passed_metrics": sum(1 for m in metrics if m.passed),
            "failed_metrics": sum(1 for m in metrics if not m.passed)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get metrics for assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics: {str(e)}"
        )

@router.get("/diagnosis-assessments/{assessment_id}/drift")
def get_drift_results(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get drift detection results for an assessment."""
    try:
        service = DiagnosisAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis assessment not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id and assessment.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        # Get drift results from the assessment
        drift_results = []
        if hasattr(assessment, 'drift_results') and assessment.drift_results:
            for drift_result in assessment.drift_results:
                drift_results.append(DriftDetectionResponse(
                    id=drift_result.id,
                    feature_name=drift_result.feature_name,
                    drift_type=drift_result.drift_type,
                    dataset_type=drift_result.dataset_type,
                    drift_score=float(drift_result.drift_score),
                    drift_threshold=float(drift_result.drift_threshold),
                    p_value=float(drift_result.p_value) if drift_result.p_value else None,
                    drift_detected=drift_result.drift_detected,
                    drift_severity=drift_result.drift_severity,
                    drift_direction=drift_result.drift_direction,
                    baseline_stats=drift_result.baseline_stats,
                    current_stats=drift_result.current_stats,
                    feature_type=drift_result.feature_type,
                    calculated_at=drift_result.calculated_at
                ))
        
        return {
            "assessment_id": assessment_id,
            "drift_detected": assessment.drift_detected,
            "drift_results": drift_results,
            "total_features": len(drift_results),
            "drifted_features": sum(1 for d in drift_results if d.drift_detected)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get drift results for assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get drift results: {str(e)}"
        )

@router.get("/diagnosis-assessments/{assessment_id}/explainability")
def get_explainability_results(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get explainability results for an assessment."""
    try:
        service = DiagnosisAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis assessment not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id and assessment.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        # Get explainability results from the assessment
        explainability_results = []
        if hasattr(assessment, 'explainability_results') and assessment.explainability_results:
            for exp_result in assessment.explainability_results:
                explainability_results.append(ExplainabilityResultResponse(
                    id=exp_result.id,
                    method=exp_result.method,
                    feature_name=exp_result.feature_name,
                    instance_id=exp_result.instance_id,
                    explanation_score=float(exp_result.explanation_score) if exp_result.explanation_score else None,
                    key_insights=exp_result.key_insights,
                    interpretation=exp_result.interpretation,
                    recommendations=exp_result.recommendations,
                    sample_size=exp_result.sample_size,
                    calculated_at=exp_result.calculated_at
                ))
        
        return {
            "assessment_id": assessment_id,
            "explainability_results": explainability_results,
            "total_results": len(explainability_results),
            "methods_used": list(set(r.method.value for r in explainability_results))
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get explainability results for assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get explainability results: {str(e)}"
        )

@router.post("/diagnosis-assessments/compare", response_model=DiagnosisComparisonResponse)
def compare_diagnosis_assessments(
    assessment_ids: List[UUID] = Body(..., description="List of assessment IDs to compare"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Compare multiple diagnosis assessments."""
    try:
        service = DiagnosisAssessmentService()
        
        # Get assessments
        assessments = []
        for assessment_id in assessment_ids:
            assessment = service.get_assessment(db, assessment_id)
            if not assessment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Diagnosis assessment {assessment_id} not found"
                )
            
            # Check access
            if assessment.created_by != current_user.id and assessment.organization_id != current_organization.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied to assessment {assessment_id}"
                )
            
            assessments.append(assessment)
        
        # Prepare comparison data
        comparison_data = []
        for assessment in assessments:
            metrics = getattr(assessment, 'performance_metrics', [])
            passed_metrics = sum(1 for m in metrics if m.passed)
            total_metrics = len(metrics)
            
            comparison_data.append({
                "assessment_id": assessment.id,
                "assessment_name": assessment.name,
                "performance_score": assessment.overall_performance_score,
                "drift_detected": assessment.drift_detected,
                "total_metrics": total_metrics,
                "passed_metrics": passed_metrics,
                "created_at": assessment.created_at
            })
        
        # Calculate comparison summary
        comparison_summary = {
            "total_assessments": len(assessments),
            "average_performance_score": sum(a.overall_performance_score for a in assessments if a.overall_performance_score) / len(assessments) if assessments else 0,
            "assessments_with_drift": sum(1 for a in assessments if a.drift_detected),
            "total_metrics": sum(len(getattr(a, 'performance_metrics', [])) for a in assessments),
            "passed_metrics": sum(sum(1 for m in getattr(a, 'performance_metrics', []) if m.passed) for a in assessments)
        }
        
        # Calculate trends
        trends = {}
        if len(assessments) > 1:
            # Sort by creation date
            sorted_assessments = sorted(assessments, key=lambda a: a.created_at)
            performance_scores = [a.overall_performance_score for a in sorted_assessments if a.overall_performance_score]
            
            if len(performance_scores) > 1:
                # Calculate trend direction
                if performance_scores[-1] > performance_scores[0]:
                    trend_direction = "improving"
                elif performance_scores[-1] < performance_scores[0]:
                    trend_direction = "declining"
                else:
                    trend_direction = "stable"
                
                trends = {
                    "direction": trend_direction,
                    "change": performance_scores[-1] - performance_scores[0],
                    "timeline": [a.created_at.isoformat() for a in sorted_assessments],
                    "scores": performance_scores
                }
        
        return DiagnosisComparisonResponse(
            assessments=comparison_data,
            comparison_summary=comparison_summary,
            trends=trends
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to compare diagnosis assessments: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compare diagnosis assessments: {str(e)}"
        )

@router.get("/diagnosis-assessments/statistics")
def get_diagnosis_assessment_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get diagnosis assessment statistics."""
    try:
        service = DiagnosisAssessmentService()
        stats = service.get_assessment_statistics(db, current_organization.id)
        return stats
    except Exception as e:
        logger.error(f"Failed to get diagnosis assessment statistics: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )

@router.get("/diagnosis-assessments/templates")
def get_diagnosis_assessment_templates():
    """Get available diagnosis assessment templates."""
    try:
        service = DiagnosisAssessmentService()
        templates = service.get_templates()
        return {
            "templates": templates,
            "total": len(templates)
        }
    except Exception as e:
        logger.error(f"Failed to get diagnosis assessment templates: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get templates: {str(e)}"
        )

@router.post("/diagnosis-assessments/{assessment_id}/monitoring", response_model=InferenceMonitoringResponse)
def setup_inference_monitoring(
    assessment_id: UUID,
    monitoring_config: InferenceMonitoringConfig,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Set up real-time inference monitoring for a model."""
    try:
        service = DiagnosisAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis assessment not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        # Create monitoring configuration
        from app.models.diagnosis_assessment import InferenceMonitoring
        monitoring = InferenceMonitoring(
            assessment_id=assessment.id,
            model_name=monitoring_config.model_name,
            model_version=monitoring_config.model_version,
            endpoint_url=monitoring_config.endpoint_url,
            sample_rate=monitoring_config.sample_rate,
            batch_size=monitoring_config.batch_size,
            alert_thresholds=monitoring_config.alert_thresholds,
            alert_contacts=monitoring_config.alert_contacts,
            monitoring_enabled=True,
            monitoring_status="active"
        )
        
        db.add(monitoring)
        db.commit()
        db.refresh(monitoring)
        
        return InferenceMonitoringResponse(
            id=monitoring.id,
            model_name=monitoring.model_name,
            monitoring_enabled=monitoring.monitoring_enabled,
            total_inferences=monitoring.total_inferences,
            last_inference_time=monitoring.last_inference_time,
            average_latency=monitoring.average_latency,
            error_rate=monitoring.error_rate,
            monitoring_status=monitoring.monitoring_status,
            last_check_time=monitoring.last_check_time,
            next_check_time=monitoring.next_check_time
        )
    except Exception as e:
        logger.error(f"Failed to set up inference monitoring: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to set up inference monitoring: {str(e)}"
        )

@router.get("/diagnosis-assessments/{assessment_id}/monitoring")
def get_inference_monitoring(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get inference monitoring status for a model."""
    try:
        from app.models.diagnosis_assessment import InferenceMonitoring
        
        # Check if user has access to this assessment
        assessment = db.query(DiagnosisAssessment).filter(
            DiagnosisAssessment.id == assessment_id
        ).first()
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnosis assessment not found"
            )
        
        if assessment.created_by != current_user.id and assessment.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        # Get monitoring configuration
        monitoring = db.query(InferenceMonitoring).filter(
            InferenceMonitoring.assessment_id == assessment_id
        ).first()
        
        if not monitoring:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Monitoring configuration not found"
            )
        
        return InferenceMonitoringResponse(
            id=monitoring.id,
            model_name=monitoring.model_name,
            monitoring_enabled=monitoring.monitoring_enabled,
            total_inferences=monitoring.total_inferences,
            last_inference_time=monitoring.last_inference_time,
            average_latency=monitoring.average_latency,
            error_rate=monitoring.error_rate,
            monitoring_status=monitoring.monitoring_status,
            last_check_time=monitoring.last_check_time,
            next_check_time=monitoring.next_check_time
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get inference monitoring: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get inference monitoring: {str(e)}"
        )