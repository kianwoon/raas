from fastapi import APIRouter, Depends, HTTPException, Query, Body
from fastapi import status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional, Dict, Any

from app.core.database import get_db
from app.api.dependencies import get_current_user, get_current_organization
from app.models.user import User
from app.models.organization import Organization
from app.models.diagnosis_assessment import DiagnosisAssessmentStatus
from app.schemas.diagnosis_assessment import (
    DiagnosisAssessmentCreate,
    DiagnosisAssessmentResponse,
    DiagnosisAssessmentListResponse,
    DiagnosisAssessmentExecutionRequest,
    DiagnosisReportRequest,
    DiagnosisReportResponse
)
from app.services.diagnosis_assessment_service import DiagnosisAssessmentService
import structlog

logger = structlog.get_logger()

router = APIRouter()


@router.post("/run", response_model=DiagnosisAssessmentResponse, status_code=status.HTTP_201_CREATED)
async def run_diagnostics(
    diagnostic_config: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization),
):
    """Run comprehensive diagnostics on a model."""
    try:
        # Create diagnosis assessment from diagnostic config
        assessment_data = DiagnosisAssessmentCreate(
            name=diagnostic_config.get("name", "Quick Diagnostic Run"),
            description=diagnostic_config.get("description", "Automated diagnostic assessment"),
            model_name=diagnostic_config.get("model_name"),
            model_version=diagnostic_config.get("model_version"),
            model_id=diagnostic_config.get("model_id"),
            diagnosis_types=diagnostic_config.get("diagnosis_types", ["performance", "drift_detection"]),
            performance_metrics=diagnostic_config.get("performance_metrics"),
            drift_detection_config=diagnostic_config.get("drift_detection_config"),
            explainability_config=diagnostic_config.get("explainability_config"),
            data_source_id=diagnostic_config.get("data_source_id"),
            baseline_data_source_id=diagnostic_config.get("baseline_data_source_id"),
            data_query=diagnostic_config.get("data_query"),
            notebook_template=diagnostic_config.get("notebook_template", "veritas_comprehensive_diagnosis_template.ipynb")
        )
        
        service = DiagnosisAssessmentService()
        
        # Create assessment
        assessment = await service.create_assessment(db, assessment_data, current_user.id, current_organization.id)
        
        # Execute assessment immediately
        execution_request = DiagnosisAssessmentExecutionRequest(
            assessment_id=assessment.id,
            execution_parameters=diagnostic_config.get("execution_parameters", {}),
            priority=diagnostic_config.get("priority", 0)
        )
        
        executed_assessment = await service.execute_assessment(db, execution_request, current_user.id, current_organization.id)
        
        return DiagnosisAssessmentResponse.from_orm(executed_assessment)
        
    except Exception as e:
        logger.error(f"Failed to run diagnostics: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run diagnostics: {str(e)}"
        )


@router.get("/runs", response_model=DiagnosisAssessmentListResponse)
async def get_diagnostics_runs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[DiagnosisAssessmentStatus] = Query(None, description="Filter by status"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_desc: bool = Query(True, description="Sort descending"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization),
):
    """Get all diagnostic runs with filtering and pagination."""
    try:
        service = DiagnosisAssessmentService()
        
        # Get assessments
        assessments = await service.get_assessments(
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
        total = await service.count_assessments(
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
        logger.error(f"Failed to get diagnostics runs: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get diagnostics runs: {str(e)}"
        )


@router.get("/runs/{run_id}", response_model=DiagnosisAssessmentResponse)
async def get_diagnostics_run(
    run_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization),
):
    """Get a specific diagnostic run by ID."""
    try:
        service = DiagnosisAssessmentService()
        assessment = await service.get_assessment(db, run_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnostic run not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id and assessment.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this diagnostic run"
            )
        
        return DiagnosisAssessmentResponse.from_orm(assessment)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get diagnostic run {run_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get diagnostic run: {str(e)}"
        )


@router.get("/runs/{run_id}/results")
async def get_diagnostics_results(
    run_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization),
):
    """Get comprehensive diagnostic run results including metrics, drift, and explainability."""
    try:
        service = DiagnosisAssessmentService()
        assessment = await service.get_assessment(db, run_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnostic run not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id and assessment.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this diagnostic run"
            )
        
        # Get performance metrics
        metrics = []
        if hasattr(assessment, 'performance_metrics') and assessment.performance_metrics:
            for metric in assessment.performance_metrics:
                metrics.append({
                    "id": metric.id,
                    "metric_name": metric.metric_name,
                    "metric_type": metric.metric_type.value,
                    "dataset_type": metric.dataset_type,
                    "metric_value": float(metric.metric_value),
                    "baseline_value": float(metric.baseline_value) if metric.baseline_value else None,
                    "confidence_interval": metric.confidence_interval,
                    "threshold_min": float(metric.threshold_min) if metric.threshold_min else None,
                    "threshold_max": float(metric.threshold_max) if metric.threshold_max else None,
                    "passed": metric.passed,
                    "degradation_detected": metric.degradation_detected,
                    "sample_size": metric.sample_size,
                    "calculated_at": metric.calculated_at
                })
        
        # Get drift results
        drift_results = []
        if hasattr(assessment, 'drift_results') and assessment.drift_results:
            for drift_result in assessment.drift_results:
                drift_results.append({
                    "id": drift_result.id,
                    "feature_name": drift_result.feature_name,
                    "drift_type": drift_result.drift_type.value,
                    "dataset_type": drift_result.dataset_type,
                    "drift_score": float(drift_result.drift_score),
                    "drift_threshold": float(drift_result.drift_threshold),
                    "p_value": float(drift_result.p_value) if drift_result.p_value else None,
                    "drift_detected": drift_result.drift_detected,
                    "drift_severity": drift_result.drift_severity,
                    "drift_direction": drift_result.drift_direction,
                    "baseline_stats": drift_result.baseline_stats,
                    "current_stats": drift_result.current_stats,
                    "feature_type": drift_result.feature_type,
                    "calculated_at": drift_result.calculated_at
                })
        
        # Get explainability results
        explainability_results = []
        if hasattr(assessment, 'explainability_results') and assessment.explainability_results:
            for exp_result in assessment.explainability_results:
                explainability_results.append({
                    "id": exp_result.id,
                    "method": exp_result.method.value,
                    "feature_name": exp_result.feature_name,
                    "instance_id": exp_result.instance_id,
                    "explanation_score": float(exp_result.explanation_score) if exp_result.explanation_score else None,
                    "feature_importance": exp_result.feature_importance,
                    "key_insights": exp_result.key_insights,
                    "interpretation": exp_result.interpretation,
                    "recommendations": exp_result.recommendations,
                    "sample_size": exp_result.sample_size,
                    "calculated_at": exp_result.calculated_at
                })
        
        # Summary statistics
        total_metrics = len(metrics)
        passed_metrics = sum(1 for m in metrics if m["passed"])
        total_drift_features = len(drift_results)
        drifted_features = sum(1 for d in drift_results if d["drift_detected"])
        
        return {
            "run_id": run_id,
            "assessment_name": assessment.name,
            "model_name": assessment.model_name,
            "model_version": assessment.model_version,
            "status": assessment.status.value,
            "overall_performance_score": assessment.overall_performance_score,
            "drift_detected": assessment.drift_detected,
            "executive_summary": assessment.executive_summary,
            "technical_summary": assessment.technical_summary,
            "created_at": assessment.created_at,
            "completed_at": assessment.completed_at,
            "duration": assessment.duration,
            "summary": {
                "total_metrics": total_metrics,
                "passed_metrics": passed_metrics,
                "failed_metrics": total_metrics - passed_metrics,
                "total_drift_features": total_drift_features,
                "drifted_features": drifted_features,
                "stable_features": total_drift_features - drifted_features
            },
            "performance_metrics": metrics,
            "drift_results": drift_results,
            "explainability_results": explainability_results,
            "report_url": assessment.report_url,
            "execution_job_id": assessment.execution_job_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get diagnostic results for run {run_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get diagnostic results: {str(e)}"
        )


@router.post("/runs/{run_id}/reports", response_model=DiagnosisReportResponse)
async def generate_diagnostics_report(
    run_id: UUID,
    report_config: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization),
):
    """Generate a comprehensive diagnostic report."""
    try:
        service = DiagnosisAssessmentService()
        assessment = await service.get_assessment(db, run_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Diagnostic run not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id and assessment.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this diagnostic run"
            )
        
        # Create report request
        report_request = DiagnosisReportRequest(
            assessment_id=run_id,
            report_type=report_config.get("report_type", "detailed"),
            title=report_config.get("title"),
            include_charts=report_config.get("include_charts", True),
            include_recommendations=report_config.get("include_recommendations", True),
            include_risk_assessment=report_config.get("include_risk_assessment", True),
            template_version=report_config.get("template_version")
        )
        
        report = await service.generate_report(db, report_request)
        
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
    except Exception as e:
        logger.error(f"Failed to generate diagnostic report for run {run_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate diagnostic report: {str(e)}"
        )


@router.get("/templates")
async def get_diagnostic_templates():
    """Get available diagnostic templates."""
    try:
        service = DiagnosisAssessmentService()
        templates = await service.get_templates()
        return {
            "templates": templates,
            "total": len(templates)
        }
    except Exception as e:
        logger.error(f"Failed to get diagnostic templates: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get diagnostic templates: {str(e)}"
        )


@router.get("/statistics")
async def get_diagnostics_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization),
):
    """Get diagnostic statistics and analytics."""
    try:
        service = DiagnosisAssessmentService()
        stats = await service.get_assessment_statistics(db, current_organization.id)
        return stats
    except Exception as e:
        logger.error(f"Failed to get diagnostic statistics: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get diagnostic statistics: {str(e)}"
        )