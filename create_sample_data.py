import pandas as pd
import numpy as np

# Generate sample data
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

print("Sample data created: test_loan_data.csv")
print(f"Dataset shape: {df.shape}")
print(f"Columns: {list(df.columns)}")
print(f"Sample data:\n{df.head()}")