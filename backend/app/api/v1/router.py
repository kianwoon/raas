from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.models import router as models_router
from app.api.v1.assessments import router as assessments_router
from app.api.v1.diagnostics import router as diagnostics_router
from app.api.v1.disclosures import router as disclosures_router
from app.api.v1.test import router as test_router
from app.api.v1.landing_page import router as landing_page_router
from app.api.v1.model_cards import router as model_cards_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.health import router as health_router
from app.api.v1.fairness_assessments import router as fairness_assessments_router

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(models_router, prefix="/models", tags=["models"])
api_router.include_router(assessments_router, prefix="/assessments", tags=["assessments"])
api_router.include_router(diagnostics_router, prefix="/diagnostics", tags=["diagnostics"])
api_router.include_router(disclosures_router, prefix="/disclosures", tags=["disclosures"])
api_router.include_router(test_router, prefix="/test", tags=["testing"])
api_router.include_router(landing_page_router, prefix="/landing-page", tags=["landing-page"])
api_router.include_router(model_cards_router, prefix="/model-cards", tags=["model-cards"])
api_router.include_router(jobs_router, tags=["jobs"])
api_router.include_router(fairness_assessments_router, prefix="/fairness-assessments", tags=["fairness-assessments"])
api_router.include_router(health_router, prefix="/health", tags=["health"])