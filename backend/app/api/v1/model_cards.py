from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.model_card_data import get_sample_model_cards

router = APIRouter()


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