from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from uuid import UUID
from app.api.dependencies import get_db, get_current_user, get_current_organization
from app.models.user import User
from app.models.organization import Organization
from app.models.fairness_assessment import FairnessAssessmentStatus
from app.schemas.fairness_assessment import (
    FairnessAssessment,
    FairnessAssessmentCreate,
    FairnessAssessmentUpdate,
    FairnessAssessmentResponse,
    FairnessAssessmentListResponse,
    FairnessAssessmentExecutionRequest,
    FairnessAssessmentConfigurationWizard,
    FairnessAssessmentWizardResponse,
    FairnessReportRequest,
    FairnessReportResponse,
    FairnessVisualizationConfig,
    FairnessMetricComparison,
    FairnessComparisonResponse
)
from app.services.fairness_assessment_service import FairnessAssessmentService
import structlog

logger = structlog.get_logger()

router = APIRouter()

@router.post("/fairness-assessments", response_model=FairnessAssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_fairness_assessment(
    assessment_data: FairnessAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Create a new fairness assessment."""
    try:
        service = FairnessAssessmentService()
        assessment = service.create_assessment(db, assessment_data, current_user.id, current_organization.id)
        return FairnessAssessmentResponse.from_orm(assessment)
    except Exception as e:
        logger.error(f"Failed to create fairness assessment: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create fairness assessment: {str(e)}"
        )

@router.get("/fairness-assessments", response_model=FairnessAssessmentListResponse)
def get_fairness_assessments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[FairnessAssessmentStatus] = Query(None, description="Filter by status"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_desc: bool = Query(True, description="Sort descending"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get fairness assessments with filtering and pagination."""
    try:
        service = FairnessAssessmentService()
        
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
        assessment_responses = [FairnessAssessmentResponse.from_orm(assessment) for assessment in assessments]
        
        return FairnessAssessmentListResponse(
            assessments=assessment_responses,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
    except Exception as e:
        logger.error(f"Failed to get fairness assessments: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get fairness assessments: {str(e)}"
        )

@router.get("/fairness-assessments/{assessment_id}", response_model=FairnessAssessmentResponse)
def get_fairness_assessment(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get a specific fairness assessment by ID."""
    try:
        service = FairnessAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fairness assessment not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id and assessment.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        return FairnessAssessmentResponse.from_orm(assessment)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get fairness assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get fairness assessment: {str(e)}"
        )

@router.put("/fairness-assessments/{assessment_id}", response_model=FairnessAssessmentResponse)
def update_fairness_assessment(
    assessment_id: UUID,
    assessment_data: FairnessAssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Update a fairness assessment."""
    try:
        service = FairnessAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fairness assessment not found"
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
        
        return FairnessAssessmentResponse.from_orm(updated_assessment)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update fairness assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update fairness assessment: {str(e)}"
        )

@router.delete("/fairness-assessments/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fairness_assessment(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Delete a fairness assessment."""
    try:
        service = FairnessAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fairness assessment not found"
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
        logger.error(f"Failed to delete fairness assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete fairness assessment: {str(e)}"
        )

@router.post("/fairness-assessments/{assessment_id}/execute", response_model=FairnessAssessmentResponse)
def execute_fairness_assessment(
    assessment_id: UUID,
    execution_request: FairnessAssessmentExecutionRequest = Body(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Execute a fairness assessment."""
    try:
        service = FairnessAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fairness assessment not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        # Use provided assessment_id if not in execution_request
        if execution_request is None:
            execution_request = FairnessAssessmentExecutionRequest(assessment_id=assessment_id)
        elif execution_request.assessment_id != assessment_id:
            execution_request.assessment_id = assessment_id
        
        executed_assessment = service.execute_assessment(db, execution_request, current_user.id, current_organization.id)
        return FairnessAssessmentResponse.from_orm(executed_assessment)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Failed to execute fairness assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute fairness assessment: {str(e)}"
        )

@router.post("/fairness-assessments/wizard", response_model=FairnessAssessmentWizardResponse)
def process_wizard_step(
    wizard_data: FairnessAssessmentConfigurationWizard,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Process a step in the fairness assessment configuration wizard."""
    try:
        service = FairnessAssessmentService()
        
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

@router.post("/fairness-assessments/{assessment_id}/reports", response_model=FairnessReportResponse)
def generate_fairness_report(
    assessment_id: UUID,
    report_request: FairnessReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Generate a fairness assessment report."""
    try:
        service = FairnessAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fairness assessment not found"
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
        
        return FairnessReportResponse(
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
        logger.error(f"Failed to generate fairness report for assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate fairness report: {str(e)}"
        )

@router.get("/fairness-assessments/{assessment_id}/visualizations")
def get_fairness_visualizations(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get fairness assessment visualizations."""
    try:
        service = FairnessAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fairness assessment not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id and assessment.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        # Generate visualization configurations
        # This would typically use the stored visualization_config from the assessment
        visualization_configs = []
        
        if assessment.visualization_config:
            visualization_configs = assessment.visualization_config.get('charts', [])
        
        return {
            "assessment_id": assessment_id,
            "visualizations": visualization_configs,
            "overall_fairness_score": assessment.overall_fairness_score,
            "status": assessment.status
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get visualizations for assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get visualizations: {str(e)}"
        )

@router.get("/fairness-assessments/{assessment_id}/metrics")
def get_fairness_metrics(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get detailed fairness metrics for an assessment."""
    try:
        service = FairnessAssessmentService()
        assessment = service.get_assessment(db, assessment_id)
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Fairness assessment not found"
            )
        
        # Check if user has access to this assessment
        if assessment.created_by != current_user.id and assessment.organization_id != current_organization.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this assessment"
            )
        
        # Get metrics from the assessment
        metrics = []
        if hasattr(assessment, 'metrics') and assessment.metrics:
            for metric in assessment.metrics:
                metrics.append({
                    "id": metric.id,
                    "metric_name": metric.metric_name,
                    "metric_type": metric.metric_type.value,
                    "protected_attribute": metric.protected_attribute,
                    "metric_value": float(metric.metric_value),
                    "threshold_value": float(metric.threshold_value) if metric.threshold_value else None,
                    "confidence_interval": metric.confidence_interval,
                    "p_value": float(metric.p_value) if metric.p_value else None,
                    "passed": metric.passed,
                    "failure_reason": metric.failure_reason,
                    "privileged_group_value": metric.privileged_group_value,
                    "unprivileged_group_value": metric.unprivileged_group_value,
                    "privileged_metric_value": float(metric.privileged_metric_value) if metric.privileged_metric_value else None,
                    "unprivileged_metric_value": float(metric.unprivileged_metric_value) if metric.unprivileged_metric_value else None,
                    "sample_size": metric.sample_size,
                    "statistical_power": metric.statistical_power,
                    "effect_size": float(metric.effect_size) if metric.effect_size else None,
                    "calculated_at": metric.calculated_at
                })
        
        return {
            "assessment_id": assessment_id,
            "metrics": metrics,
            "overall_fairness_score": assessment.overall_fairness_score,
            "total_metrics": len(metrics),
            "passed_metrics": sum(1 for m in metrics if m["passed"]),
            "failed_metrics": sum(1 for m in metrics if not m["passed"])
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get metrics for assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get metrics: {str(e)}"
        )

@router.post("/fairness-assessments/compare", response_model=FairnessComparisonResponse)
def compare_fairness_assessments(
    assessment_ids: List[UUID] = Body(..., description="List of assessment IDs to compare"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Compare multiple fairness assessments."""
    try:
        service = FairnessAssessmentService()
        
        # Get assessments
        assessments = []
        for assessment_id in assessment_ids:
            assessment = service.get_assessment(db, assessment_id)
            if not assessment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Fairness assessment {assessment_id} not found"
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
            metrics = []
            if hasattr(assessment, 'metrics') and assessment.metrics:
                for metric in assessment.metrics:
                    metrics.append({
                        "id": metric.id,
                        "metric_name": metric.metric_name,
                        "metric_type": metric.metric_type.value,
                        "protected_attribute": metric.protected_attribute,
                        "metric_value": float(metric.metric_value),
                        "threshold_value": float(metric.threshold_value) if metric.threshold_value else None,
                        "passed": metric.passed,
                        "privileged_group_value": metric.privileged_group_value,
                        "unprivileged_group_value": metric.unprivileged_group_value,
                        "privileged_metric_value": float(metric.privileged_metric_value) if metric.privileged_metric_value else None,
                        "unprivileged_metric_value": float(metric.unprivileged_metric_value) if metric.unprivileged_metric_value else None,
                        "calculated_at": metric.calculated_at
                    })
            
            comparison_data.append(FairnessMetricComparison(
                assessment_id=assessment.id,
                assessment_name=assessment.name,
                metrics=metrics,
                overall_fairness_score=assessment.overall_fairness_score,
                created_at=assessment.created_at
            ))
        
        # Calculate comparison summary
        comparison_summary = {
            "total_assessments": len(assessments),
            "average_fairness_score": sum(a.overall_fairness_score for a in assessments if a.overall_fairness_score) / len(assessments),
            "best_fairness_score": max((a.overall_fairness_score for a in assessments if a.overall_fairness_score), default=0),
            "worst_fairness_score": min((a.overall_fairness_score for a in assessments if a.overall_fairness_score), default=0)
        }
        
        # Calculate trends
        trends = {}
        if len(assessments) > 1:
            # Sort by creation date
            sorted_assessments = sorted(assessments, key=lambda a: a.created_at)
            fairness_scores = [a.overall_fairness_score for a in sorted_assessments if a.overall_fairness_score]
            
            if len(fairness_scores) > 1:
                # Calculate trend direction
                if fairness_scores[-1] > fairness_scores[0]:
                    trend_direction = "improving"
                elif fairness_scores[-1] < fairness_scores[0]:
                    trend_direction = "declining"
                else:
                    trend_direction = "stable"
                
                trends = {
                    "direction": trend_direction,
                    "change": fairness_scores[-1] - fairness_scores[0],
                    "timeline": [a.created_at.isoformat() for a in sorted_assessments],
                    "scores": fairness_scores
                }
        
        return FairnessComparisonResponse(
            assessments=comparison_data,
            comparison_summary=comparison_summary,
            trends=trends
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to compare fairness assessments: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compare fairness assessments: {str(e)}"
        )

@router.get("/fairness-assessments/statistics")
def get_fairness_assessment_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    current_organization: Organization = Depends(get_current_organization)
):
    """Get fairness assessment statistics."""
    try:
        service = FairnessAssessmentService()
        stats = service.get_assessment_statistics(db, current_organization.id)
        return stats
    except Exception as e:
        logger.error(f"Failed to get fairness assessment statistics: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )

@router.get("/fairness-assessments/templates")
def get_fairness_assessment_templates():
    """Get available fairness assessment templates."""
    try:
        templates = [
            {
                "id": "veritas_fairness",
                "name": "Veritas Fairness Assessment",
                "description": "Comprehensive fairness assessment using AIF360 and custom metrics",
                "protected_attributes": ["gender", "race", "age"],
                "metrics": ["demographic_parity", "equal_opportunity", "predictive_parity"],
                "notebook_template": "veritas_fairness_assessment_template.ipynb"
            },
            {
                "id": "basic_fairness",
                "name": "Basic Fairness Check",
                "description": "Quick fairness assessment with essential metrics",
                "protected_attributes": ["gender", "race"],
                "metrics": ["demographic_parity", "equal_opportunity"],
                "notebook_template": "basic_fairness_assessment_template.ipynb"
            },
            {
                "id": "comprehensive_fairness",
                "name": "Comprehensive Fairness Analysis",
                "description": "Detailed fairness analysis with advanced metrics and visualizations",
                "protected_attributes": ["gender", "race", "age", "income"],
                "metrics": ["demographic_parity", "equal_opportunity", "predictive_parity", "equalized_odds"],
                "notebook_template": "comprehensive_fairness_assessment_template.ipynb"
            }
        ]
        
        return {
            "templates": templates,
            "total": len(templates)
        }
    except Exception as e:
        logger.error(f"Failed to get fairness assessment templates: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get templates: {str(e)}"
        )