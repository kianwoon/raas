from fastapi import APIRouter
from backend.app.api.v1 import model_cards, compliance_frameworks, landing_page, data_ingestion

api_router = APIRouter()

# Include all API routers
api_router.include_router(
    model_cards.router,
    prefix="/model-cards",
    tags=["model-cards"]
)

api_router.include_router(
    compliance_frameworks.router,
    prefix="/compliance-frameworks",
    tags=["compliance-frameworks"]
)

api_router.include_router(
    landing_page.router,
    prefix="/landing-page",
    tags=["landing-page"]
)

api_router.include_router(
    data_ingestion.router,
    prefix="/data-ingestion",
    tags=["data-ingestion"]
)