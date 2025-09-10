from typing import List, Dict, Any, Optional
from uuid import uuid4
import random

def get_sample_model_cards(count: int = 3) -> List[Dict[str, Any]]:
    """
    Generate sample model card data for the landing page.
    """
    domains = ["Finance", "Healthcare", "Retail", "Security", "Education", "Transportation", "Manufacturing"]
    risk_tiers = ["low", "medium", "high", "critical"]
    statuses = ["draft", "pending_review", "approved", "deprecated"]
    
    model_cards = []
    
    for i in range(count):
        domain = random.choice(domains)
        risk_tier = random.choice(risk_tiers)
        status = random.choice(statuses)
        fairness_score = random.uniform(0.6, 0.98)
        
        model_card = {
            "id": str(uuid4()),
            "name": f"{domain} AI Model {i+1}",
            "version": f"1.{random.randint(0, 9)}.{random.randint(0, 9)}",
            "description": f"This AI model is designed to optimize processes in the {domain} industry. It has been evaluated for fairness and transparency across multiple demographic groups.",
            "domain": domain,
            "risk_tier": risk_tier,
            "status": status,
            "fairness_score": fairness_score,
            "organization_id": str(uuid4()),
            "documentation_url": f"https://docs.example.com/model-{i+1}",
            "contact_email": f"contact{i+1}@example.com",
            "tags": [f"{domain}", "AI", "fairness", "transparency"],
            "metadata": {
                "created_at": "2023-01-15T10:30:00Z",
                "updated_at": "2023-06-20T14:45:00Z",
                "model_type": random.choice(["classification", "regression", "clustering", "nlp"]),
                "training_data_size": random.randint(1000, 100000)
            }
        }
        
        model_cards.append(model_card)
    
    return model_cards


def get_sample_fairness_score_distribution() -> Dict[str, int]:
    """
    Generate sample fairness score distribution data.
    """
    return {
        "0.0-0.5": 5,
        "0.5-0.7": 15,
        "0.7-0.85": 35,
        "0.85-0.95": 65,
        "0.95-1.0": 30
    }


def get_sample_model_card_statistics() -> Dict[str, Any]:
    """
    Generate sample model card statistics.
    """
    return {
        "total_model_cards": 150,
        "average_fairness_score": 0.87,
        "domain_distribution": {
            "Finance": 25,
            "Healthcare": 30,
            "Retail": 20,
            "Security": 15,
            "Education": 20,
            "Transportation": 15,
            "Manufacturing": 25
        },
        "risk_tier_distribution": {
            "low": 50,
            "medium": 60,
            "high": 30,
            "critical": 10
        },
        "status_distribution": {
            "draft": 20,
            "pending_review": 30,
            "approved": 90,
            "deprecated": 10
        }
    }