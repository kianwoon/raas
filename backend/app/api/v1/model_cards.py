from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, UUID4
from uuid import UUID

from app.core.database import get_db
from app.services.model_card_data import get_sample_model_cards
from app.services.automated_model_card_service import automated_model_card_service
from app.services.evidence_pack_service import evidence_pack_generator
from app.services.model_card_enhancement_service import model_card_enhancement_service
from app.services.model_card_template_service import model_card_template_service
from app.services.notification_service import notification_service
from app.crud.model_card import model_card

router = APIRouter()


# Pydantic models for request/response
class ModelCardGenerateRequest(BaseModel):
    fairness_assessment_id: Optional[UUID4] = None
    diagnosis_assessment_id: Optional[UUID4] = None
    template_type: str = "technical"
    model_card_data: Optional[Dict[str, Any]] = None


class ModelCardVersionRequest(BaseModel):
    version: str
    changelog: str
    is_current: bool = True


class ApprovalRequest(BaseModel):
    approver_ids: List[UUID4]
    approval_comments: str


class ApprovalDecisionRequest(BaseModel):
    approver_id: UUID4
    decision: str  # approved, rejected, request_changes
    approval_comments: str
    conditions: Optional[List[str]] = None


class EvidencePackRequest(BaseModel):
    format: str = "json"
    include_sections: Optional[Dict[str, bool]] = None
    branding_config: Optional[Dict[str, Any]] = None


class ReportGenerationRequest(BaseModel):
    report_type: str = "comprehensive"
    template_id: Optional[str] = None
    include_appendices: bool = True


@router.get("/")
def read_model_cards(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    domain: Optional[str] = Query(None),
    risk_tier: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """
    Retrieve model cards with optional filtering.
    """
    # For now, return consistent sample data
    sample_cards = [
        {
            "id": "1d6896f6-2685-40b8-9a19-d055c6721dc4",
            "name": "Transportation AI Model 1",
            "version": "1.7.6",
            "description": "This AI model is designed to optimize processes in the Transportation industry. It uses advanced machine learning algorithms to predict traffic patterns and optimize routing efficiency.",
            "domain": "Transportation",
            "risk_tier": "medium",
            "status": "approved",
            "fairness_score": 0.85,
            "organization_id": "org-001",
            "tags": ["transportation", "optimization", "traffic"],
            "metadata": {"model_type": "Neural Network", "accuracy": 0.92}
        },
        {
            "id": "d05df73f-8e21-470e-bd43-2a09ea0d51d9",
            "name": "Security AI Model 1", 
            "version": "1.6.9",
            "description": "Advanced security model designed to detect and prevent cybersecurity threats in real-time using pattern recognition and anomaly detection.",
            "domain": "Security",
            "risk_tier": "high",
            "status": "approved",
            "fairness_score": 0.78,
            "organization_id": "org-002",
            "tags": ["security", "cybersecurity", "threat-detection"],
            "metadata": {"model_type": "Random Forest", "accuracy": 0.89}
        },
        {
            "id": "06c17b42-20f2-45dc-bd0e-debe88b26bcd",
            "name": "Retail AI Model 1",
            "version": "1.5.3", 
            "description": "Customer behavior prediction model for retail applications, analyzing purchase patterns and preferences to personalize shopping experiences.",
            "domain": "Retail",
            "risk_tier": "low",
            "status": "approved",
            "fairness_score": 0.91,
            "organization_id": "org-003",
            "tags": ["retail", "customer-behavior", "personalization"],
            "metadata": {"model_type": "Gradient Boosting", "accuracy": 0.94}
        }
    ]
    
    # Apply filters if provided
    filtered_cards = sample_cards
    if domain:
        filtered_cards = [card for card in filtered_cards if card["domain"].lower() == domain.lower()]
    if risk_tier:
        filtered_cards = [card for card in filtered_cards if card["risk_tier"].lower() == risk_tier.lower()]
    if status:
        filtered_cards = [card for card in filtered_cards if card["status"].lower() == status.lower()]
    if search:
        search_lower = search.lower()
        filtered_cards = [card for card in filtered_cards if 
                        search_lower in card["name"].lower() or 
                        search_lower in card["description"].lower()]
    
    # Apply pagination
    start = skip
    end = start + limit
    paginated_cards = filtered_cards[start:end]
    
    return {
        "models": paginated_cards,
        "total": len(filtered_cards),
        "page": (skip // limit) + 1,
        "size": limit
    }


@router.get("/statistics")
def get_model_card_statistics():
    """
    Get model card statistics.
    """
    # For now, return sample statistics
    return {
        "total_models": 150,
        "models_by_domain": {
            "Healthcare": 45,
            "Finance": 38,
            "Retail": 32,
            "Manufacturing": 20,
            "Other": 15
        },
        "models_by_risk_tier": {
            "Low": 65,
            "Medium": 52,
            "High": 33
        },
        "compliance_rate": 87.5,
        "avg_fairness_score": 0.82
    }


@router.get("/fairness-distribution")
def get_fairness_score_distribution():
    """
    Get fairness score distribution.
    """
    # For now, return sample distribution
    return {
        "0.0-0.5": 5,
        "0.5-0.7": 15,
        "0.7-0.85": 35,
        "0.85-0.95": 65,
        "0.95-1.0": 30
    }


@router.get("/{model_card_id}")
def get_model_card_detail(model_card_id: str):
    """
    Get detailed information about a specific model card.
    """
    # For demo purposes, return sample data for any valid UUID format
    # In a real implementation, this would fetch from the database
    
    # Sample model card data - in production this would come from the database
    sample_model_cards = [
        {
            "id": "1d6896f6-2685-40b8-9a19-d055c6721dc4",
            "name": "Transportation AI Model 1",
            "version": "1.7.6",
            "description": "This AI model is designed to optimize processes in the Transportation industry. It uses advanced machine learning algorithms to predict traffic patterns and optimize routing efficiency.",
            "domain": "Transportation",
            "risk_tier": "medium",
            "status": "approved",
            "fairness_score": 0.85,
            "organization_id": "org-001",
            "tags": ["transportation", "optimization", "traffic"],
            "metadata": {"model_type": "Neural Network", "accuracy": 0.92}
        },
        {
            "id": "d05df73f-8e21-470e-bd43-2a09ea0d51d9",
            "name": "Security AI Model 1", 
            "version": "1.6.9",
            "description": "Advanced security model designed to detect and prevent cybersecurity threats in real-time using pattern recognition and anomaly detection.",
            "domain": "Security",
            "risk_tier": "high",
            "status": "approved",
            "fairness_score": 0.78,
            "organization_id": "org-002",
            "tags": ["security", "cybersecurity", "threat-detection"],
            "metadata": {"model_type": "Random Forest", "accuracy": 0.89}
        },
        {
            "id": "06c17b42-20f2-45dc-bd0e-debe88b26bcd",
            "name": "Retail AI Model 1",
            "version": "1.5.3", 
            "description": "Customer behavior prediction model for retail applications, analyzing purchase patterns and preferences to personalize shopping experiences.",
            "domain": "Retail",
            "risk_tier": "low",
            "status": "approved",
            "fairness_score": 0.91,
            "organization_id": "org-003",
            "tags": ["retail", "customer-behavior", "personalization"],
            "metadata": {"model_type": "Gradient Boosting", "accuracy": 0.94}
        }
    ]
    
    # Find the model card with the matching ID
    model_card = next((card for card in sample_model_cards if card["id"] == model_card_id), None)
    
    if not model_card:
        return {"error": "Model card not found"}, 404
    
    # Add additional fields for the detail view
    model_card_detail = {
        "model_card": {
            **model_card,
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-20T14:45:00Z",
            "contact_email": "ai-team@example.com",
            "documentation_url": "https://docs.example.com/model-card",
            "tags": ["responsible-ai", "fairness", "transparency"],
            "metadata": {
                "training_data_size": "100,000 samples",
                "model_type": "Neural Network",
                "framework": "TensorFlow 2.12"
            }
        },
        "fairness_metrics": [
            {
                "id": "1",
                "metric_name": "Demographic Parity Difference",
                "metric_value": 0.15,
                "threshold_value": 0.10,
                "demographic_group": "Gender",
                "created_at": "2024-01-18T10:30:00Z"
            },
            {
                "id": "2", 
                "metric_name": "Equal Opportunity Difference",
                "metric_value": 0.08,
                "threshold_value": 0.10,
                "demographic_group": "Age Group",
                "created_at": "2024-01-18T10:30:00Z"
            },
            {
                "id": "3",
                "metric_name": "Predictive Parity",
                "metric_value": 0.95,
                "threshold_value": 0.90,
                "demographic_group": "Race",
                "created_at": "2024-01-18T10:30:00Z"
            }
        ],
        "compliance_info": [
            {
                "id": "1",
                "framework_name": "FEAT Framework",
                "framework_version": "1.0",
                "compliance_status": "compliant",
                "assessment_date": "2024-01-15T00:00:00Z",
                "notes": "All fairness metrics meet the required thresholds.",
                "evidence_url": "https://audit.example.com/feat-assessment"
            },
            {
                "id": "2",
                "framework_name": "EU AI Act",
                "framework_version": "Draft",
                "compliance_status": "partially_compliant",
                "assessment_date": "2024-01-10T00:00:00Z",
                "notes": "Additional documentation required for high-risk classification.",
                "evidence_url": "https://audit.example.com/eu-ai-act"
            }
        ]
    }
    
    return model_card_detail


# ====== AUTOMATED MODEL CARD GENERATION ENDPOINTS ======

@router.post("/generate")
def generate_model_card_from_assessments(
    request: ModelCardGenerateRequest,
    db: Session = Depends(get_db),
    current_user: str = "system"  # In production, get from auth
):
    """
    Generate a model card automatically from assessment results.
    """
    try:
        generated_model_card = automated_model_card_service.generate_model_card_from_assessments(
            db=db,
            fairness_assessment_id=request.fairness_assessment_id,
            diagnosis_assessment_id=request.diagnosis_assessment_id,
            template_type=request.template_type,
            model_card_data=request.model_card_data,
            current_user=current_user
        )
        
        return {
            "status": "success",
            "message": "Model card generated successfully",
            "model_card": {
                "id": str(generated_model_card.id),
                "name": generated_model_card.name,
                "version": generated_model_card.version,
                "fairness_score": float(generated_model_card.fairness_score),
                "status": generated_model_card.status
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate model card: {str(e)}")


@router.post("/{model_card_id}/evidence-pack")
def generate_evidence_pack(
    model_card_id: str,
    request: EvidencePackRequest,
    db: Session = Depends(get_db)
):
    """
    Generate evidence pack for a model card.
    """
    try:
        evidence_pack = evidence_pack_generator.generate_evidence_pack(
            db=db,
            model_card_id=UUID(model_card_id),
            format=request.format,
            include_sections=request.include_sections,
            branding_config=request.branding_config
        )
        
        return {
            "status": "success",
            "message": f"Evidence pack generated in {request.format} format",
            "evidence_pack": evidence_pack
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate evidence pack: {str(e)}")


@router.get("/{model_card_id}/evidence-pack/download")
def download_evidence_pack(
    model_card_id: str,
    format: str = Query("zip", regex="^(json|pdf|html|zip)$"),
    expiration_hours: int = Query(24, ge=1, le=168),
    db: Session = Depends(get_db)
):
    """
    Generate and download evidence pack.
    """
    try:
        download_info = evidence_pack_generator.download_evidence_pack(
            db=db,
            model_card_id=UUID(model_card_id),
            format=format,
            expiration_hours=expiration_hours
        )
        
        return {
            "status": "success",
            "message": "Evidence pack ready for download",
            "download_info": download_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to prepare evidence pack download: {str(e)}")


@router.post("/{model_card_id}/versions")
def create_model_card_version(
    model_card_id: str,
    request: ModelCardVersionRequest,
    db: Session = Depends(get_db),
    current_user: str = "system"  # In production, get from auth
):
    """
    Create a new version of a model card.
    """
    try:
        version_data = {
            "version": request.version,
            "is_current": request.is_current
        }
        
        new_version = automated_model_card_service.create_model_card_version(
            db=db,
            model_card_id=UUID(model_card_id),
            version_data=version_data,
            changelog=request.changelog,
            current_user=current_user
        )
        
        return {
            "status": "success",
            "message": "Model card version created successfully",
            "version": {
                "id": str(new_version.id),
                "version": new_version.version,
                "is_current": new_version.is_current,
                "created_at": new_version.created_at.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create model card version: {str(e)}")


@router.get("/{model_card_id}/versions")
def get_model_card_versions(
    model_card_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all versions of a model card.
    """
    try:
        from app.models.model_card import ModelVersion
        
        versions = db.query(ModelVersion).filter(
            ModelVersion.model_card_id == UUID(model_card_id)
        ).order_by(ModelVersion.created_at.desc()).all()
        
        return {
            "versions": [
                {
                    "id": str(version.id),
                    "version": version.version,
                    "changelog": version.changelog,
                    "is_current": version.is_current,
                    "created_at": version.created_at.isoformat(),
                    "created_by": str(version.created_by) if version.created_by else None
                }
                for version in versions
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model card versions: {str(e)}")


@router.post("/{model_card_id}/submit-for-approval")
def submit_model_card_for_approval(
    model_card_id: str,
    request: ApprovalRequest,
    db: Session = Depends(get_db),
    current_user: str = "system"  # In production, get from auth
):
    """
    Submit model card for approval workflow.
    """
    try:
        approval_result = automated_model_card_service.submit_for_approval(
            db=db,
            model_card_id=UUID(model_card_id),
            approver_ids=request.approver_ids,
            approval_comments=request.approval_comments,
            current_user=current_user
        )
        
        return {
            "status": "success",
            "message": "Model card submitted for approval",
            "approval_result": approval_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit for approval: {str(e)}")


@router.post("/{model_card_id}/approve")
def approve_model_card(
    model_card_id: str,
    request: ApprovalDecisionRequest,
    db: Session = Depends(get_db)
):
    """
    Process approval decision for model card.
    """
    try:
        approval_result = automated_model_card_service.approve_model_card(
            db=db,
            model_card_id=UUID(model_card_id),
            approver_id=request.approver_id,
            approval_decision=request.decision,
            approval_comments=request.approval_comments,
            conditions=request.conditions
        )
        
        return {
            "status": "success",
            "message": f"Model card {request.decision}",
            "approval_result": approval_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process approval: {str(e)}")


@router.get("/{model_card_id}/approval-status")
def get_approval_status(
    model_card_id: str,
    db: Session = Depends(get_db)
):
    """
    Get approval status for model card.
    """
    try:
        model_card_obj = model_card.get(db, id=UUID(model_card_id))
        if not model_card_obj:
            raise HTTPException(status_code=404, detail="Model card not found")
        
        return {
            "model_card_id": model_card_id,
            "status": model_card_obj.status,
            "approval_workflow": {
                "current_status": model_card_obj.status,
                "last_updated": model_card_obj.updated_at.isoformat() if model_card_obj.updated_at else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get approval status: {str(e)}")


@router.post("/{model_card_id}/reports")
def generate_model_card_report(
    model_card_id: str,
    request: ReportGenerationRequest,
    db: Session = Depends(get_db)
):
    """
    Generate formatted model card report.
    """
    try:
        report = evidence_pack_generator.generate_model_card_report(
            db=db,
            model_card_id=UUID(model_card_id),
            report_type=request.report_type,
            template_id=request.template_id,
            include_appendices=request.include_appendices
        )
        
        return {
            "status": "success",
            "message": f"{request.report_type} report generated",
            "report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


@router.get("/{model_card_id}/enhanced-summary")
def get_enhanced_model_card_summary(
    model_card_id: str,
    include_recommendations: bool = Query(True),
    db: Session = Depends(get_db)
):
    """
    Get enhanced model card summary with all calculated metrics.
    """
    try:
        summary = model_card_enhancement_service.generate_model_card_summary(
            db=db,
            model_card_id=UUID(model_card_id),
            include_recommendations=include_recommendations
        )
        
        return {
            "status": "success",
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate enhanced summary: {str(e)}")


@router.get("/{model_card_id}/fairness-analysis")
def get_fairness_analysis(
    model_card_id: str,
    include_weighted_factors: bool = Query(True),
    recalculate: bool = Query(False),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive fairness analysis.
    """
    try:
        analysis = model_card_enhancement_service.calculate_comprehensive_fairness_score(
            db=db,
            model_card_id=UUID(model_card_id),
            include_weighted_factors=include_weighted_factors,
            recalculate=recalculate
        )
        
        return {
            "status": "success",
            "fairness_analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate fairness analysis: {str(e)}")


@router.get("/{model_card_id}/performance-analysis")
def get_performance_analysis(
    model_card_id: str,
    include_baselines: bool = Query(True),
    calculate_trends: bool = Query(True),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive performance analysis.
    """
    try:
        analysis = model_card_enhancement_service.calculate_performance_metrics(
            db=db,
            model_card_id=UUID(model_card_id),
            include_baselines=include_baselines,
            calculate_trends=calculate_trends
        )
        
        return {
            "status": "success",
            "performance_analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate performance analysis: {str(e)}")


@router.get("/{model_card_id}/drift-status")
def get_drift_status(
    model_card_id: str,
    lookback_days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    Get drift status analysis.
    """
    try:
        drift_analysis = model_card_enhancement_service.detect_drift_status(
            db=db,
            model_card_id=UUID(model_card_id),
            lookback_days=lookback_days
        )
        
        return {
            "status": "success",
            "drift_analysis": drift_analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to detect drift status: {str(e)}")


@router.get("/{model_card_id}/compliance-status")
def get_compliance_status(
    model_card_id: str,
    frameworks: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive compliance status.
    """
    try:
        compliance_analysis = model_card_enhancement_service.calculate_compliance_status(
            db=db,
            model_card_id=UUID(model_card_id),
            include_frameworks=frameworks
        )
        
        return {
            "status": "success",
            "compliance_analysis": compliance_analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate compliance status: {str(e)}")


@router.get("/{model_card_id}/explainability-insights")
def get_explainability_insights(
    model_card_id: str,
    include_feature_importance: bool = Query(True),
    include_shap_values: bool = Query(True),
    db: Session = Depends(get_db)
):
    """
    Get explainability insights.
    """
    try:
        insights = model_card_enhancement_service.calculate_explainability_insights(
            db=db,
            model_card_id=UUID(model_card_id),
            include_feature_importance=include_feature_importance,
            include_shap_values=include_shap_values
        )
        
        return {
            "status": "success",
            "explainability_insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate explainability insights: {str(e)}")


@router.post("/{model_card_id}/publish")
def publish_model_card(
    model_card_id: str,
    db: Session = Depends(get_db),
    current_user: str = "system"  # In production, get from auth
):
    """
    Publish model card (change status to active/published).
    """
    try:
        model_card_obj = model_card.get(db, id=UUID(model_card_id))
        if not model_card_obj:
            raise HTTPException(status_code=404, detail="Model card not found")
        
        # Update status to published
        updated_model_card = model_card.update(
            db=db,
            db_obj=model_card_obj,
            obj_in={"status": "active"}
        )
        
        # Log the publication
        from app.crud.model_card import model_audit_log
        model_audit_log.create(
            db=db,
            model_card_id=UUID(model_card_id),
            action="publish",
            performed_by=current_user,
            new_values={"status": "active"}
        )
        
        return {
            "status": "success",
            "message": "Model card published successfully",
            "model_card": {
                "id": str(updated_model_card.id),
                "name": updated_model_card.name,
                "version": updated_model_card.version,
                "status": updated_model_card.status
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to publish model card: {str(e)}")


@router.post("/{model_card_id}/archive")
def archive_model_card(
    model_card_id: str,
    db: Session = Depends(get_db),
    current_user: str = "system"  # In production, get from auth
):
    """
    Archive model card (change status to archived).
    """
    try:
        model_card_obj = model_card.get(db, id=UUID(model_card_id))
        if not model_card_obj:
            raise HTTPException(status_code=404, detail="Model card not found")
        
        # Update status to archived
        updated_model_card = model_card.update(
            db=db,
            db_obj=model_card_obj,
            obj_in={"status": "archived"}
        )
        
        # Log the archiving
        from app.crud.model_card import model_audit_log
        model_audit_log.create(
            db=db,
            model_card_id=UUID(model_card_id),
            action="archive",
            performed_by=current_user,
            new_values={"status": "archived"}
        )
        
        return {
            "status": "success",
            "message": "Model card archived successfully",
            "model_card": {
                "id": str(updated_model_card.id),
                "name": updated_model_card.name,
                "version": updated_model_card.version,
                "status": updated_model_card.status
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to archive model card: {str(e)}")


@router.post("/{model_card_id}/unarchive")
def unarchive_model_card(
    model_card_id: str,
    db: Session = Depends(get_db),
    current_user: str = "system"  # In production, get from auth
):
    """
    Unarchive model card (change status back to active).
    """
    try:
        model_card_obj = model_card.get(db, id=UUID(model_card_id))
        if not model_card_obj:
            raise HTTPException(status_code=404, detail="Model card not found")
        
        # Update status to active
        updated_model_card = model_card.update(
            db=db,
            db_obj=model_card_obj,
            obj_in={"status": "active"}
        )
        
        # Log the unarchiving
        from app.crud.model_card import model_audit_log
        model_audit_log.create(
            db=db,
            model_card_id=UUID(model_card_id),
            action="unarchive",
            performed_by=current_user,
            new_values={"status": "active"}
        )
        
        return {
            "status": "success",
            "message": "Model card unarchived successfully",
            "model_card": {
                "id": str(updated_model_card.id),
                "name": updated_model_card.name,
                "version": updated_model_card.version,
                "status": updated_model_card.status
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unarchive model card: {str(e)}")


@router.get("/{model_card_id}/audit-log")
def get_model_card_audit_log(
    model_card_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """
    Get audit log for model card.
    """
    try:
        from app.models.model_card import ModelAuditLog
        
        audit_logs = db.query(ModelAuditLog).filter(
            ModelAuditLog.model_card_id == UUID(model_card_id)
        ).order_by(ModelAuditLog.performed_at.desc()).offset(skip).limit(limit).all()
        
        return {
            "audit_logs": [
                {
                    "id": str(log.id),
                    "action": log.action,
                    "performed_by": str(log.performed_by),
                    "performed_at": log.performed_at.isoformat(),
                    "details": log.details,
                    "previous_values": log.previous_values,
                    "new_values": log.new_values
                }
                for log in audit_logs
            ],
            "total": db.query(ModelAuditLog).filter(
                ModelAuditLog.model_card_id == UUID(model_card_id)
            ).count()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get audit log: {str(e)}")


# ====== BATCH OPERATIONS ======

@router.post("/batch/generate")
def batch_generate_model_cards(
    requests: List[ModelCardGenerateRequest],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: str = "system"  # In production, get from auth
):
    """
    Generate multiple model cards in batch.
    """
    try:
        results = []
        
        for request in requests:
            try:
                generated_model_card = automated_model_card_service.generate_model_card_from_assessments(
                    db=db,
                    fairness_assessment_id=request.fairness_assessment_id,
                    diagnosis_assessment_id=request.diagnosis_assessment_id,
                    template_type=request.template_type,
                    model_card_data=request.model_card_data,
                    current_user=current_user
                )
                
                results.append({
                    "status": "success",
                    "model_card_id": str(generated_model_card.id),
                    "name": generated_model_card.name
                })
            except Exception as e:
                results.append({
                    "status": "error",
                    "error": str(e),
                    "request": request.dict()
                })
        
        return {
            "status": "completed",
            "results": results,
            "total": len(requests),
            "successful": sum(1 for r in results if r["status"] == "success"),
            "failed": sum(1 for r in results if r["status"] == "error")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate model cards in batch: {str(e)}")


@router.post("/batch/evidence-packs")
def batch_generate_evidence_packs(
    model_card_ids: List[str],
    background_tasks: BackgroundTasks,
    format: str = Query("json", regex="^(json|pdf|html|zip)$"),
    db: Session = Depends(get_db)
):
    """
    Generate evidence packs for multiple model cards.
    """
    try:
        results = []
        
        for model_card_id in model_card_ids:
            try:
                evidence_pack = evidence_pack_generator.generate_evidence_pack(
                    db=db,
                    model_card_id=UUID(model_card_id),
                    format=format
                )
                
                results.append({
                    "status": "success",
                    "model_card_id": model_card_id,
                    "format": format
                })
            except Exception as e:
                results.append({
                    "status": "error",
                    "model_card_id": model_card_id,
                    "error": str(e)
                })
        
        return {
            "status": "completed",
            "results": results,
            "total": len(model_card_ids),
            "successful": sum(1 for r in results if r["status"] == "success"),
            "failed": sum(1 for r in results if r["status"] == "error")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate evidence packs in batch: {str(e)}")


# ====== TEMPLATE ENDPOINTS ======

@router.get("/templates")
def get_available_templates():
    """
    Get all available model card templates.
    """
    try:
        templates = model_card_template_service.get_template_definitions()
        return {
            "status": "success",
            "templates": templates
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get templates: {str(e)}")


@router.get("/templates/{template_type}")
def get_template_details(template_type: str):
    """
    Get detailed information about a specific template.
    """
    try:
        template_preview = model_card_template_service.get_template_preview(template_type)
        return {
            "status": "success",
            "template": template_preview
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get template details: {str(e)}")


@router.post("/templates/{template_type}/generate")
def generate_model_card_from_template(
    template_type: str,
    model_card_data: Dict[str, Any],
    fairness_assessment_id: Optional[UUID4] = None,
    diagnosis_assessment_id: Optional[UUID4] = None,
    db: Session = Depends(get_db)
):
    """
    Generate model card content using a specific template.
    """
    try:
        # Get assessment results if provided
        assessment_results = None
        if fairness_assessment_id or diagnosis_assessment_id:
            assessment_results = automated_model_card_service._generate_model_card_data(
                fairness_results=None,  # Would fetch from DB
                diagnosis_results=None,  # Would fetch from DB
                template_type=template_type,
                custom_data=model_card_data
            )

        # Generate content from template
        template_content = model_card_template_service.generate_model_card_from_template(
            template_type=template_type,
            model_card_data=model_card_data,
            assessment_results=assessment_results
        )

        return {
            "status": "success",
            "template_type": template_type,
            "content": template_content,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate model card from template: {str(e)}")


# ====== NOTIFICATION ENDPOINTS ======

@router.post("/{model_card_id}/notifications/test")
async def test_model_card_notifications(
    model_card_id: str,
    notification_type: str = Query(..., regex="^(model_card_created|model_card_approved|model_card_rejected|assessment_completed|drift_detected)$"),
    db: Session = Depends(get_db)
):
    """
    Send test notification for model card.
    """
    try:
        from app.services.notification_service import NotificationRecipient
        
        # Create test recipient
        test_recipient = NotificationRecipient(
            user_id=UUID("00000000-0000-0000-0000-000000000001"),
            email="test@example.com",
            name="Test User",
            role="admin",
            notification_preferences={"email_enabled": True, "in_app_enabled": True}
        )

        # Send appropriate test notification based on type
        if notification_type == "model_card_created":
            await notification_service.notify_model_card_created(
                db=db,
                model_card_id=UUID(model_card_id),
                created_by="test_user",
                recipients=[test_recipient]
            )
        elif notification_type == "model_card_approved":
            await notification_service.notify_model_card_approved(
                db=db,
                model_card_id=UUID(model_card_id),
                approver_id=UUID("00000000-0000-0000-0000-000000000002"),
                approval_comments="Test approval",
                recipients=[test_recipient]
            )
        elif notification_type == "assessment_completed":
            await notification_service.notify_assessment_completed(
                db=db,
                assessment_id=UUID("00000000-0000-0000-0000-000000000003"),
                assessment_type="fairness",
                model_card_id=UUID(model_card_id),
                results_summary={"overall_score": 0.85},
                recipients=[test_recipient]
            )
        elif notification_type == "drift_detected":
            await notification_service._notify_drift_detected(
                db=db,
                model_card_id=UUID(model_card_id),
                drift_results={"drift_severity": "medium", "drift_percentage": 15.0},
                recipients=[test_recipient]
            )

        return {
            "status": "success",
            "message": f"Test '{notification_type}' notification sent",
            "recipient": test_recipient.email
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send test notification: {str(e)}")


@router.get("/{model_card_id}/notifications/preferences")
def get_notification_preferences(
    model_card_id: str,
    user_id: UUID4,
    db: Session = Depends(get_db)
):
    """
    Get notification preferences for a user on a model card.
    """
    try:
        # This would typically fetch from user preferences in the database
        return {
            "status": "success",
            "preferences": {
                "email_enabled": True,
                "in_app_enabled": True,
                "webhook_enabled": False,
                "sms_enabled": False,
                "notification_types": [
                    "model_card_created",
                    "model_card_approved",
                    "model_card_rejected",
                    "assessment_completed",
                    "drift_detected"
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get notification preferences: {str(e)}")


# ====== GOVERNANCE ENDPOINTS ======

@router.get("/governance/dashboard")
def get_governance_dashboard(
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get governance dashboard overview.
    """
    try:
        from app.models.model_card import ModelCard
        
        # Get overall statistics
        total_model_cards = db.query(ModelCard).count()
        
        # Get status distribution
        status_distribution = db.query(
            ModelCard.status,
            func.count(ModelCard.id).label('count')
        ).group_by(ModelCard.status).all()
        
        # Get risk tier distribution
        risk_distribution = db.query(
            ModelCard.risk_tier,
            func.count(ModelCard.id).label('count')
        ).group_by(ModelCard.risk_tier).all()
        
        # Get pending approvals
        pending_approvals = db.query(ModelCard).filter(
            ModelCard.status == "pending_approval"
        ).count()

        return {
            "status": "success",
            "dashboard": {
                "total_model_cards": total_model_cards,
                "status_distribution": {status: count for status, count in status_distribution},
                "risk_distribution": {risk: count for risk, count in risk_distribution},
                "pending_approvals": pending_approvals,
                "compliance_rate": 85.5,  # Mock value
                "average_fairness_score": 0.82  # Mock value
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get governance dashboard: {str(e)}")


@router.get("/governance/review-queue")
def get_review_queue(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None)
):
    """
    Get model cards requiring review.
    """
    try:
        from app.models.model_card import ModelCard
        
        query = db.query(ModelCard)
        
        if status:
            query = query.filter(ModelCard.status == status)
        else:
            # Default to pending approvals and high-risk items
            query = query.filter(
                or_(
                    ModelCard.status == "pending_approval",
                    ModelCard.risk_tier == "high"
                )
            )
        
        model_cards = query.offset(skip).limit(limit).all()
        
        return {
            "status": "success",
            "review_queue": [
                {
                    "id": str(card.id),
                    "name": card.name,
                    "version": card.version,
                    "status": card.status,
                    "risk_tier": card.risk_tier,
                    "fairness_score": float(card.fairness_score),
                    "created_at": card.created_at.isoformat(),
                    "updated_at": card.updated_at.isoformat() if card.updated_at else None
                }
                for card in model_cards
            ],
            "total": query.count()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get review queue: {str(e)}")


@router.post("/governance/batch-approve")
def batch_approve_model_cards(
    model_card_ids: List[str],
    approver_id: UUID4,
    approval_comments: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Approve multiple model cards in batch.
    """
    try:
        results = []
        
        for model_card_id in model_card_ids:
            try:
                approval_result = automated_model_card_service.approve_model_card(
                    db=db,
                    model_card_id=UUID(model_card_id),
                    approver_id=approver_id,
                    approval_decision="approved",
                    approval_comments=approval_comments
                )
                
                results.append({
                    "model_card_id": model_card_id,
                    "status": "approved",
                    "result": approval_result
                })
            except Exception as e:
                results.append({
                    "model_card_id": model_card_id,
                    "status": "error",
                    "error": str(e)
                })
        
        return {
            "status": "completed",
            "results": results,
            "total": len(model_card_ids),
            "successful": sum(1 for r in results if r["status"] == "approved"),
            "failed": sum(1 for r in results if r["status"] == "error")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to batch approve model cards: {str(e)}")


# Add missing import
from datetime import datetime