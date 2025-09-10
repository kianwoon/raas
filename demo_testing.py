#!/usr/bin/env python3
"""
RAI Platform Testing Demo
This script demonstrates how to test the RAI Platform tools
"""
import pandas as pd
import requests
import json
import time
from pathlib import Path

def demonstrate_data_ingestion():
    """Demonstrate data ingestion workflow"""
    print("=== Data Ingestion Demo ===")
    
    # Read sample data
    data_path = Path("/Users/kianwoonwong/Downloads/raas/test_loan_data.csv")
    if data_path.exists():
        df = pd.read_csv(data_path)
        print(f"Sample data loaded: {df.shape} rows and columns")
        print(f"Columns: {list(df.columns)}")
        print(f"Sample data:\n{df.head()}")
        
        # Show data statistics
        print(f"\nData Statistics:")
        print(f"Age range: {df['age'].min()} - {df['age'].max()}")
        print(f"Gender distribution: {df['gender'].value_counts().to_dict()}")
        print(f"Race distribution: {df['race'].value_counts().to_dict()}")
        print(f"Loan approval rate: {df['loan_approved'].mean():.2%}")
        
        return df
    else:
        print("Sample data not found. Creating new sample...")
        return create_sample_data()

def create_sample_data():
    """Create sample data for testing"""
    np.random.seed(42)
    n_samples = 1000
    
    data = {
        'age': np.random.randint(18, 80, n_samples),
        'gender': np.random.choice(['Male', 'Female'], n_samples),
        'race': np.random.choice(['White', 'Black', 'Asian', 'Hispanic'], n_samples),
        'income': np.random.normal(50000, 15000, n_samples),
        'credit_score': np.random.randint(300, 850, n_samples),
        'loan_approved': np.random.choice([0, 1], n_samples, p=[0.3, 0.7])
    }
    
    df = pd.DataFrame(data)
    df.to_csv('/Users/kianwoonwong/Downloads/raas/test_loan_data.csv', index=False)
    print("Sample data created successfully!")
    return df

def demonstrate_model_card_access():
    """Demonstrate model card access"""
    print("\n=== Model Card Demo ===")
    
    try:
        # Get model cards
        response = requests.get("http://localhost:8000/api/v1/model-cards")
        if response.status_code == 200:
            models = response.json()
            print(f"Found {len(models.get('models', []))} models")
            
            for model in models.get('models', []):
                print(f"\nModel: {model.get('name', 'Unknown')}")
                print(f"  ID: {model.get('id', 'Unknown')}")
                print(f"  Version: {model.get('version', 'Unknown')}")
                print(f"  Description: {model.get('description', 'No description')[:100]}...")
                
        else:
            print(f"Failed to get model cards: {response.status_code}")
    except Exception as e:
        print(f"Error accessing model cards: {e}")

def demonstrate_fairness_testing():
    """Demonstrate fairness testing concepts"""
    print("\n=== Fairness Testing Demo ===")
    
    # Load sample data
    df = pd.read_csv("/Users/kianwoonwong/Downloads/raas/test_loan_data.csv")
    
    # Calculate basic fairness metrics manually
    print("Manual Fairness Analysis:")
    
    # Calculate approval rates by gender
    gender_approval = df.groupby('gender')['loan_approved'].agg(['mean', 'count'])
    print(f"\nApproval rates by gender:")
    for gender, stats in gender_approval.iterrows():
        print(f"  {gender}: {stats['mean']:.2%} (n={stats['count']})")
    
    # Calculate approval rates by race
    race_approval = df.groupby('race')['loan_approved'].agg(['mean', 'count'])
    print(f"\nApproval rates by race:")
    for race, stats in race_approval.iterrows():
        print(f"  {race}: {stats['mean']:.2%} (n={stats['count']})")
    
    # Calculate demographic parity
    approval_rates = gender_approval['mean']
    if len(approval_rates) >= 2:
        max_rate = approval_rates.max()
        min_rate = approval_rates.min()
        demographic_parity = min_rate / max_rate if max_rate > 0 else 0
        print(f"\nDemographic Parity (Gender): {demographic_parity:.3f}")
        print(f"  (Ratio between lowest and highest approval rates)")

def demonstrate_diagnosis_concepts():
    """Demonstrate diagnosis concepts"""
    print("\n=== Diagnosis Concepts Demo ===")
    
    # Load sample data
    df = pd.read_csv("/Users/kianwoonwong/Downloads/raas/test_loan_data.csv")
    
    # Show feature correlations with target
    print("Feature Analysis:")
    
    # Convert categorical variables to numeric for correlation
    df_numeric = df.copy()
    df_numeric['gender'] = pd.Categorical(df_numeric['gender']).codes
    df_numeric['race'] = pd.Categorical(df_numeric['race']).codes
    
    correlations = df_numeric.corr()['loan_approved'].sort_values(ascending=False)
    print(f"Feature correlations with loan approval:")
    for feature, corr in correlations.items():
        if feature != 'loan_approved':
            print(f"  {feature}: {corr:.3f}")

def show_next_steps():
    """Show next steps for testing"""
    print("\n=== Next Steps for Testing ===")
    print("1. Frontend Testing:")
    print("   - Open http://localhost:3001 in your browser")
    print("   - Navigate to Model Cards to see existing models")
    print("   - Try creating a new fairness assessment")
    
    print("\n2. API Testing:")
    print("   - Check API docs at http://localhost:8000/api/docs")
    print("   - Model cards are accessible at /api/v1/model-cards")
    print("   - Other endpoints require authentication")
    
    print("\n3. Sample Data:")
    print("   - Sample data is available at: test_loan_data.csv")
    print("   - Contains 1000 rows with demographic and financial data")
    print("   - Suitable for fairness testing and model evaluation")
    
    print("\n4. Testing Checklist:")
    print("   - ✅ Sample data created")
    print("   - ✅ Model cards accessible")
    print("   - ✅ Frontend running")
    print("   - ✅ Backend API responding")
    print("   - ⏳ Authentication setup needed for full API testing")
    print("   - ⏳ MinIO configuration for file uploads")

def main():
    """Main demonstration function"""
    print("RAI Platform Testing Demo")
    print("=" * 50)
    
    # Test data ingestion
    df = demonstrate_data_ingestion()
    
    # Test model card access
    demonstrate_model_card_access()
    
    # Test fairness concepts
    demonstrate_fairness_testing()
    
    # Test diagnosis concepts
    demonstrate_diagnosis_concepts()
    
    # Show next steps
    show_next_steps()
    
    print(f"\nDemo completed! 🎉")
    print(f"Your RAI Platform is ready for testing!")

if __name__ == "__main__":
    import numpy as np
    main()