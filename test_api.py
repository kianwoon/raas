#!/usr/bin/env python3
"""
Simple test script to verify RAI Platform API endpoints
"""
import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_endpoint(endpoint, method="GET", data=None):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        
        print(f"{method} {endpoint}: {response.status_code}")
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"  Response: {json.dumps(result, indent=2)[:200]}...")
            except:
                print(f"  Response: {response.text[:200]}...")
        else:
            print(f"  Error: {response.text[:200]}...")
        return response.status_code == 200
    except Exception as e:
        print(f"{method} {endpoint}: Failed - {str(e)}")
        return False

def main():
    print("Testing RAI Platform API Endpoints")
    print("=" * 40)
    
    # Test health endpoint
    test_endpoint("/")
    
    # Test model cards
    test_endpoint("/model-cards")
    
    # Create sample model card
    model_card_data = {
        "name": "Test Loan Approval Model",
        "description": "A test model for API verification",
        "model_type": "classification",
        "model_version": "1.0.0",
        "model_path": "/models/test_model.pkl",
        "input_features": ["age", "gender", "race", "income", "credit_score"],
        "target_feature": "loan_approved",
        "performance_metrics": {
            "accuracy": 0.85,
            "precision": 0.82,
            "recall": 0.88,
            "f1_score": 0.85
        },
        "fairness_metrics": {
            "demographic_parity": 0.82,
            "equal_opportunity": 0.79,
            "disparate_impact": 0.85
        },
        "created_by": "test_user",
        "tags": ["test", "loan", "fairness"]
    }
    
    test_endpoint("/model-cards", "POST", model_card_data)
    
    # Test fairness assessments
    test_endpoint("/fairness-assessments/fairness-assessments")
    
    # Test diagnostics
    test_endpoint("/diagnostics/runs")
    
    # Test data upload endpoint
    test_endpoint("/data/upload")
    
    print("\nTest completed!")

if __name__ == "__main__":
    main()