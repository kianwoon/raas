from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.crud.model_card import model_card
from app.services.model_card_service import model_card_service
from app.services.model_card_data import get_sample_model_cards, get_sample_fairness_score_distribution, get_sample_model_card_statistics

router = APIRouter()


@router.get("/model-cards", response_model=List[Dict[str, Any]])
async def get_featured_model_cards(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(3, ge=1, le=10),
    use_sample_data: bool = Query(True)
):
    """
    Get featured model cards for the landing page showcase.
    """
    # Return consistent sample data that matches the model cards API
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
    
    # Apply limit
    return sample_cards[:limit]


@router.get("/fairness-distribution", response_model=Dict[str, int])
async def get_fairness_score_distribution(
    db: AsyncSession = Depends(get_db),
    use_sample_data: bool = Query(True)
):
    """
    Get the distribution of fairness scores for the visualization section.
    """
    # For now, always return sample data to avoid database schema issues
    return get_sample_fairness_score_distribution()


@router.get("/statistics", response_model=Dict[str, Any])
async def get_model_card_statistics(
    db: AsyncSession = Depends(get_db),
    use_sample_data: bool = Query(True)
):
    """
    Get overall model card statistics for the transparency metrics dashboard.
    """
    # For now, always return sample data to avoid database schema issues
    return get_sample_model_card_statistics()


@router.get("/compliance-frameworks", response_model=List[Dict[str, Any]])
async def get_compliance_frameworks(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(4, ge=1, le=10),
    use_sample_data: bool = Query(True)
):
    """
    Get compliance frameworks for the educational content section.
    """
    if use_sample_data:
        # Sample compliance frameworks data
        return [
            {
                "id": "1",
                "name": "FEAT Framework",
                "description": "Fairness, Ethics, Accountability, and Transparency framework for AI systems",
                "version": "1.0",
                "authority": "AI Ethics Board",
                "industry": "General"
            },
            {
                "id": "2",
                "name": "PDPA Compliance",
                "description": "Personal Data Protection Act compliance framework for AI systems",
                "version": "2.1",
                "authority": "Singapore PDPC",
                "industry": "General"
            },
            {
                "id": "3",
                "name": "HKMA Principles",
                "description": "Hong Kong Monetary Authority principles for AI governance",
                "version": "1.2",
                "authority": "Hong Kong Monetary Authority",
                "industry": "Finance"
            },
            {
                "id": "4",
                "name": "EU AI Act",
                "description": "European Union Artificial Intelligence Act compliance framework",
                "version": "Draft",
                "authority": "European Commission",
                "industry": "General"
            }
        ]
    
    # For now, return empty list as compliance_framework CRUD doesn't exist yet
    return []


@router.get("/reports", response_model=List[Dict[str, Any]])
async def get_recent_reports(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(4, ge=1, le=10),
    use_sample_data: bool = Query(False)
):
    """
    Get recent reports for the recent reports section.
    """
    # For now, always return sample data since report CRUD doesn't exist
    return [
        {
            "id": "1",
            "title": "Annual Fairness in AI Report 2024",
            "description": "Comprehensive analysis of fairness trends across 150+ AI models in diverse industries.",
            "date": "June 15, 2024",
            "category": "Industry Report",
            "link": "/reports/annual-fairness-2024"
        },
        {
            "id": "2",
            "title": "Compliance Framework Comparison",
            "description": "Detailed comparison of major AI compliance frameworks and their implementation challenges.",
            "date": "May 28, 2024",
            "category": "Analysis",
            "link": "/reports/compliance-frameworks"
        },
        {
            "id": "3",
            "title": "Bias Detection in Financial AI Models",
            "description": "Case study on identifying and mitigating bias in credit scoring algorithms.",
            "date": "April 12, 2024",
            "category": "Case Study",
            "link": "/reports/bias-detection-finance"
        },
        {
            "id": "4",
            "title": "Transparency Best Practices in Healthcare AI",
            "description": "Guidelines for enhancing transparency in diagnostic and treatment recommendation systems.",
            "date": "March 5, 2024",
            "category": "Best Practices",
            "link": "/reports/transparency-healthcare"
        }
    ]


@router.get("/educational-content", response_model=Dict[str, Any])
async def get_educational_content(
    db: AsyncSession = Depends(get_db),
    use_sample_data: bool = Query(True)
):
    """
    Get educational content for the educational content hub section.
    """
    if use_sample_data:
        # Sample educational content data
        return {
            "guides": [
                {
                    "id": "1",
                    "title": "Getting Started with Model Cards",
                    "description": "A comprehensive guide to creating and using model cards for AI transparency.",
                    "reading_time": "15 min",
                    "difficulty": "Beginner",
                    "link": "/guides/getting-started-model-cards"
                },
                {
                    "id": "2",
                    "title": "Measuring Fairness in AI Systems",
                    "description": "Learn about different fairness metrics and how to apply them to your models.",
                    "reading_time": "20 min",
                    "difficulty": "Intermediate",
                    "link": "/guides/measuring-fairness"
                }
            ],
            "tutorials": [
                {
                    "id": "1",
                    "title": "Creating Your First Model Card",
                    "description": "Step-by-step tutorial on creating a comprehensive model card.",
                    "duration": "25 min",
                    "link": "/tutorials/creating-first-model-card"
                },
                {
                    "id": "2",
                    "title": "Integrating Fairness Metrics",
                    "description": "Learn how to integrate fairness metrics into your ML pipeline.",
                    "duration": "30 min",
                    "link": "/tutorials/integrating-fairness-metrics"
                }
            ],
            "use_cases": [
                {
                    "id": "1",
                    "title": "Financial Services",
                    "description": "How financial institutions are using model cards for credit scoring models.",
                    "icon": "🏦",
                    "link": "/use-cases/financial-services"
                },
                {
                    "id": "2",
                    "title": "Healthcare",
                    "description": "Ensuring transparency and fairness in diagnostic AI systems.",
                    "icon": "🏥",
                    "link": "/use-cases/healthcare"
                }
            ]
        }
    
    # This would normally fetch data from the database
    # For now, return the sample data from above
    return {
        "guides": [
            {
                "id": "1",
                "title": "Getting Started with Model Cards",
                "description": "A comprehensive guide to creating and using model cards for AI transparency.",
                "reading_time": "15 min",
                "difficulty": "Beginner",
                "link": "/guides/getting-started-model-cards"
            },
            {
                "id": "2",
                "title": "Measuring Fairness in AI Systems",
                "description": "Learn about different fairness metrics and how to apply them to your models.",
                "reading_time": "20 min",
                "difficulty": "Intermediate",
                "link": "/guides/measuring-fairness"
            }
        ],
        "tutorials": [
            {
                "id": "1",
                "title": "Creating Your First Model Card",
                "description": "Step-by-step tutorial on creating a comprehensive model card.",
                "duration": "25 min",
                "link": "/tutorials/creating-first-model-card"
            },
            {
                "id": "2",
                "title": "Integrating Fairness Metrics",
                "description": "Learn how to integrate fairness metrics into your ML pipeline.",
                "duration": "30 min",
                "link": "/tutorials/integrating-fairness-metrics"
            }
        ],
        "use_cases": [
            {
                "id": "1",
                "title": "Financial Services",
                "description": "How financial institutions are using model cards for credit scoring models.",
                "icon": "🏦",
                "link": "/use-cases/financial-services"
            },
            {
                "id": "2",
                "title": "Healthcare",
                "description": "Ensuring transparency and fairness in diagnostic AI systems.",
                "icon": "🏥",
                "link": "/use-cases/healthcare"
            }
        ]
    }