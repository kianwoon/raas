import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_db
from app.models.model_card import Base, ModelCard, FairnessMetric, ComplianceInfo

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the database tables
Base.metadata.create_all(bind=engine)

# Override the get_db dependency to use the test database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture
def sample_model_card():
    return {
        "name": "Test Model",
        "version": "1.0.0",
        "description": "A test model for unit testing",
        "domain": "healthcare",
        "risk_tier": "medium",
        "status": "draft",
        "organization_id": "org1",
        "contact_email": "test@example.com",
        "tags": ["test", "healthcare"],
        "fairness_score": 0.85
    }

@pytest.fixture
def sample_fairness_metric():
    return {
        "metric_name": "Demographic Parity",
        "metric_value": 0.85,
        "threshold_value": 0.8,
        "demographic_group": "gender"
    }

@pytest.fixture
def sample_compliance_info():
    return {
        "framework_name": "AI Ethics Framework",
        "framework_version": "1.0",
        "compliance_status": "compliant",
        "assessment_date": "2023-01-01",
        "notes": "Model meets all compliance requirements"
    }

def test_create_model_card(sample_model_card):
    response = client.post("/api/v1/model-cards", json=sample_model_card)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == sample_model_card["name"]
    assert data["version"] == sample_model_card["version"]
    assert data["id"] is not None

def test_get_model_cards():
    # First create a model card
    sample_model_card = {
        "name": "Test Model for List",
        "version": "1.0.0",
        "description": "A test model for unit testing",
        "domain": "finance",
        "risk_tier": "low",
        "status": "approved",
        "organization_id": "org1"
    }
    client.post("/api/v1/model-cards", json=sample_model_card)
    
    # Then get the list of model cards
    response = client.get("/api/v1/model-cards")
    assert response.status_code == 200
    data = response.json()
    assert len(data["models"]) >= 1
    assert data["total"] >= 1

def test_get_model_card_with_filters():
    # Create model cards with different domains
    model_card_1 = {
        "name": "Healthcare Model",
        "version": "1.0.0",
        "description": "A healthcare model",
        "domain": "healthcare",
        "risk_tier": "medium",
        "status": "approved",
        "organization_id": "org1"
    }
    model_card_2 = {
        "name": "Finance Model",
        "version": "1.0.0",
        "description": "A finance model",
        "domain": "finance",
        "risk_tier": "low",
        "status": "draft",
        "organization_id": "org1"
    }
    
    client.post("/api/v1/model-cards", json=model_card_1)
    client.post("/api/v1/model-cards", json=model_card_2)
    
    # Filter by domain
    response = client.get("/api/v1/model-cards?domain=healthcare")
    assert response.status_code == 200
    data = response.json()
    assert all(card["domain"] == "healthcare" for card in data["models"])
    
    # Filter by risk tier
    response = client.get("/api/v1/model-cards?risk_tier=low")
    assert response.status_code == 200
    data = response.json()
    assert all(card["risk_tier"] == "low" for card in data["models"])
    
    # Filter by status
    response = client.get("/api/v1/model-cards?status=draft")
    assert response.status_code == 200
    data = response.json()
    assert all(card["status"] == "draft" for card in data["models"])
    
    # Search by name
    response = client.get("/api/v1/model-cards?search=Healthcare")
    assert response.status_code == 200
    data = response.json()
    assert all("Healthcare" in card["name"] for card in data["models"])

def test_get_model_card_by_id(sample_model_card):
    # Create a model card
    create_response = client.post("/api/v1/model-cards", json=sample_model_card)
    model_card_id = create_response.json()["id"]
    
    # Get the model card by ID
    response = client.get(f"/api/v1/model-cards/{model_card_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["model_card"]["id"] == model_card_id
    assert data["model_card"]["name"] == sample_model_card["name"]

def test_update_model_card(sample_model_card):
    # Create a model card
    create_response = client.post("/api/v1/model-cards", json=sample_model_card)
    model_card_id = create_response.json()["id"]
    
    # Update the model card
    update_data = {
        "name": "Updated Test Model",
        "status": "approved"
    }
    response = client.put(f"/api/v1/model-cards/{model_card_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["status"] == update_data["status"]

def test_delete_model_card(sample_model_card):
    # Create a model card
    create_response = client.post("/api/v1/model-cards", json=sample_model_card)
    model_card_id = create_response.json()["id"]
    
    # Delete the model card
    response = client.delete(f"/api/v1/model-cards/{model_card_id}")
    assert response.status_code == 204
    
    # Verify the model card is deleted
    response = client.get(f"/api/v1/model-cards/{model_card_id}")
    assert response.status_code == 404

def test_add_fairness_metrics(sample_model_card, sample_fairness_metric):
    # Create a model card
    create_response = client.post("/api/v1/model-cards", json=sample_model_card)
    model_card_id = create_response.json()["id"]
    
    # Add fairness metrics
    response = client.post(f"/api/v1/model-cards/{model_card_id}/fairness-metrics", json=sample_fairness_metric)
    assert response.status_code == 201
    data = response.json()
    assert data["metric_name"] == sample_fairness_metric["metric_name"]
    assert data["model_card_id"] == model_card_id

def test_get_fairness_metrics(sample_model_card, sample_fairness_metric):
    # Create a model card
    create_response = client.post("/api/v1/model-cards", json=sample_model_card)
    model_card_id = create_response.json()["id"]
    
    # Add fairness metrics
    client.post(f"/api/v1/model-cards/{model_card_id}/fairness-metrics", json=sample_fairness_metric)
    
    # Get fairness metrics
    response = client.get(f"/api/v1/model-cards/{model_card_id}/fairness-metrics")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["metric_name"] == sample_fairness_metric["metric_name"]

def test_add_compliance_info(sample_model_card, sample_compliance_info):
    # Create a model card
    create_response = client.post("/api/v1/model-cards", json=sample_model_card)
    model_card_id = create_response.json()["id"]
    
    # Add compliance info
    response = client.post(f"/api/v1/model-cards/{model_card_id}/compliance-info", json=sample_compliance_info)
    assert response.status_code == 201
    data = response.json()
    assert data["framework_name"] == sample_compliance_info["framework_name"]
    assert data["model_card_id"] == model_card_id

def test_get_compliance_info(sample_model_card, sample_compliance_info):
    # Create a model card
    create_response = client.post("/api/v1/model-cards", json=sample_model_card)
    model_card_id = create_response.json()["id"]
    
    # Add compliance info
    client.post(f"/api/v1/model-cards/{model_card_id}/compliance-info", json=sample_compliance_info)
    
    # Get compliance info
    response = client.get(f"/api/v1/model-cards/{model_card_id}/compliance-info")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["framework_name"] == sample_compliance_info["framework_name"]

def test_get_model_card_statistics():
    # Create multiple model cards with different properties
    model_cards = [
        {
            "name": "Healthcare Model 1",
            "version": "1.0.0",
            "description": "A healthcare model",
            "domain": "healthcare",
            "risk_tier": "low",
            "status": "approved",
            "organization_id": "org1",
            "fairness_score": 0.9
        },
        {
            "name": "Healthcare Model 2",
            "version": "1.0.0",
            "description": "Another healthcare model",
            "domain": "healthcare",
            "risk_tier": "medium",
            "status": "draft",
            "organization_id": "org1",
            "fairness_score": 0.7
        },
        {
            "name": "Finance Model",
            "version": "1.0.0",
            "description": "A finance model",
            "domain": "finance",
            "risk_tier": "high",
            "status": "approved",
            "organization_id": "org1",
            "fairness_score": 0.8
        }
    ]
    
    for model_card in model_cards:
        client.post("/api/v1/model-cards", json=model_card)
    
    # Get statistics
    response = client.get("/api/v1/model-cards/statistics")
    assert response.status_code == 200
    data = response.json()
    
    # Check that statistics are calculated correctly
    assert data["total_models"] >= 3
    assert data["by_domain"]["healthcare"] >= 2
    assert data["by_domain"]["finance"] >= 1
    assert data["by_risk_tier"]["low"] >= 1
    assert data["by_risk_tier"]["medium"] >= 1
    assert data["by_risk_tier"]["high"] >= 1
    assert data["by_status"]["approved"] >= 2
    assert data["by_status"]["draft"] >= 1

def test_get_fairness_score_distribution():
    # Create model cards with different fairness scores
    model_cards = [
        {
            "name": "Model 1",
            "version": "1.0.0",
            "description": "Model with low fairness score",
            "domain": "healthcare",
            "risk_tier": "low",
            "status": "approved",
            "organization_id": "org1",
            "fairness_score": 0.3
        },
        {
            "name": "Model 2",
            "version": "1.0.0",
            "description": "Model with medium fairness score",
            "domain": "healthcare",
            "risk_tier": "medium",
            "status": "approved",
            "organization_id": "org1",
            "fairness_score": 0.6
        },
        {
            "name": "Model 3",
            "version": "1.0.0",
            "description": "Model with high fairness score",
            "domain": "finance",
            "risk_tier": "high",
            "status": "approved",
            "organization_id": "org1",
            "fairness_score": 0.9
        }
    ]
    
    for model_card in model_cards:
        client.post("/api/v1/model-cards", json=model_card)
    
    # Get fairness score distribution
    response = client.get("/api/v1/model-cards/fairness-distribution")
    assert response.status_code == 200
    data = response.json()
    
    # Check that distribution is calculated correctly
    assert data["0.0-0.2"] >= 0
    assert data["0.2-0.4"] >= 1  # Model 1
    assert data["0.4-0.6"] >= 0
    assert data["0.6-0.8"] >= 1  # Model 2
    assert data["0.8-1.0"] >= 1  # Model 3