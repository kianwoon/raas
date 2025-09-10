# RAI Platform Testing Guide

## 🚀 Quick Start

The RAI Platform is now running with all Veritas tools integrated. Here's how to test each component:

### 🌐 **Access Points**
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs

---

## 📊 **1. Testing Model Cards**

### Frontend Testing
1. Navigate to http://localhost:3001/model-cards
2. You should see sample model cards displayed
3. Test filtering and pagination features

### API Testing
```bash
# Get all model cards
curl -s http://localhost:8000/api/v1/model-cards | jq

# Get model card statistics
curl -s http://localhost:8000/api/v1/model-cards/statistics | jq

# Get fairness score distribution
curl -s http://localhost:8000/api/v1/model-cards/fairness-distribution | jq
```

---

## ⚖️ **2. Testing Fairness Assessment Tools**

### Frontend Testing
1. Navigate to http://localhost:3001/fairness-assessments
2. The page is now accessible and shows a fairness assessments interface
3. Click "New Assessment" to create a fairness assessment
4. Available pages for testing:
   - **Model Cards**: http://localhost:3001/model-cards
   - **Fairness Assessments**: http://localhost:3001/fairness-assessments
   - **Diagnostics**: http://localhost:3001/diagnostics
   - **Data Ingestion**: http://localhost:3001/data-ingestion
   - **Job Monitoring**: http://localhost:3001/jobs

### API Testing
```bash
# Create a new fairness assessment
curl -X POST http://localhost:8000/api/v1/fairness-assessments/fairness-assessments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Fairness Assessment",
    "description": "Testing fairness assessment tools",
    "model_id": "1d6896f6-2685-40b8-9a19-d055c6721dc4",
    "dataset_config": {
      "data_source": "uploaded_file",
      "file_path": "/path/to/test/data.csv"
    },
    "protected_attributes": ["race", "gender"],
    "thresholds": {
      "demographic_parity": 0.8,
      "equal_opportunity": 0.8
    }
  }'

# Get all fairness assessments
curl -s http://localhost:8000/api/v1/fairness-assessments/fairness-assessments | jq

# Execute fairness assessment
curl -X POST http://localhost:8000/api/v1/fairness-assessments/fairness-assessments/{assessment_id}/execute

# Get assessment results
curl -s http://localhost:8000/api/v1/fairness-assessments/fairness-assessments/{assessment_id}/metrics | jq
```

---

## 🔍 **3. Testing Diagnosis & Explainability Tools**

### Frontend Testing
1. Navigate to http://localhost:3001/diagnostics
2. Click "Run Diagnosis"
3. Configure the diagnosis:
   - **Model ID**: Select from dropdown
   - **Diagnosis Type**: "Drift Detection" or "Feature Importance"
   - **Test Dataset**: Upload or select test data
   - **Baseline Dataset**: Upload or select baseline data

### API Testing
```bash
# Run drift detection
curl -X POST http://localhost:8000/api/v1/diagnostics/run \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "1d6896f6-2685-40b8-9a19-d055c6721dc4",
    "diagnosis_type": "drift_detection",
    "test_data_path": "/path/to/test/data.csv",
    "baseline_data_path": "/path/to/baseline/data.csv",
    "config": {
      "significance_level": 0.05,
      "min_drift_score": 0.1
    }
  }'

# Get diagnosis results
curl -s http://localhost:8000/api/v1/diagnostics/runs/{run_id}/results | jq

# Get diagnosis reports
curl -s http://localhost:8000/api/v1/diagnostics/runs/{run_id}/reports | jq
```

---

## 🔄 **4. Testing Job Execution Pipeline**

### Frontend Testing
1. Navigate to http://localhost:3001/jobs
2. You should see the job monitoring dashboard
3. Check for Celery worker status

### API Testing
```bash
# Get all jobs
curl -s http://localhost:8000/api/v1/jobs | jq

# Get job statistics
curl -s http://localhost:8000/api/v1/jobs/stats | jq

# Monitor specific job
curl -s http://localhost:8000/api/v1/jobs/{job_id} | jq

# Check job artifacts
curl -s http://localhost:8000/api/v1/jobs/{job_id}/artifacts | jq
```

---

## 📥 **5. Testing Data Ingestion**

### Frontend Testing
1. Navigate to http://localhost:3001/data-ingestion
2. Test file upload with different formats:
   - CSV files
   - JSON files
   - Excel files
   - Parquet files

### API Testing
```bash
# Upload a file for processing
curl -X POST http://localhost:8000/api/v1/data/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/test/data.csv" \
  -F "dataset_name=test_dataset" \
  -F "description=Test dataset upload"

# Test external connectors (if configured)
curl -X POST http://localhost:8000/api/v1/data/connectors/s3 \
  -H "Content-Type: application/json" \
  -d '{
    "bucket_name": "test-bucket",
    "file_path": "test/data.csv",
    "access_key": "your-access-key",
    "secret_key": "your-secret-key"
  }'
```

---

## 🎯 **6. Testing Model Card Generation**

### Frontend Testing
1. Navigate to http://localhost:3001/model-cards
2. Click "Generate Model Card" on any model
3. Select assessment results to include
4. Choose template type: "Technical", "Executive", or "Regulatory"
5. Generate and download the model card

### API Testing
```bash
# Generate model card from assessments
curl -X POST http://localhost:8000/api/v1/model-cards/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "1d6896f6-2685-40b8-9a19-d055c6721dc4",
    "fairness_assessment_id": "{fairness_assessment_id}",
    "diagnosis_assessment_id": "{diagnosis_assessment_id}",
    "template_type": "technical"
  }'

# Generate evidence pack
curl -X POST http://localhost:8000/api/v1/model-cards/{model_card_id}/evidence-pack \
  -H "Content-Type: application/json" \
  -d '{
    "format": "pdf",
    "include_sections": {
      "fairness": true,
      "performance": true,
      "compliance": true
    }
  }'
```

---

## 🧪 **7. Testing Sample Data**

### Create Sample Test Data
```python
# Create a simple CSV file for testing
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
df.to_csv('test_loan_data.csv', index=False)

print("Sample data created: test_loan_data.csv")
```

### Test with Sample Data
1. Upload the generated CSV file through the frontend
2. Run fairness assessment using the uploaded data
3. Run diagnosis using the uploaded data
4. Generate model cards with the assessment results

---

## 📈 **8. Monitoring & Verification**

### Check System Health
```bash
# Check overall system health
curl -s http://localhost:8000/health | jq

# Check Celery worker status
curl -s http://localhost:8000/api/v1/jobs/stats | jq

# Check database connectivity
curl -s http://localhost:8000/api/v1/health/database | jq
```

### Monitor Logs
```bash
# View backend logs
docker-compose logs -f app

# View Celery worker logs
docker-compose logs -f celery_worker

# View frontend logs
docker-compose logs -f web
```

---

## 🚨 **9. Common Issues & Solutions**

### Issue: File Upload Fails
- Check file size limits in configuration
- Verify file format is supported
- Check MinIO connectivity (if using object storage)

### Issue: Assessment Jobs Fail
- Check Celery worker is running: `docker-compose ps`
- Verify data format is correct
- Check protected attributes match dataset columns

### Issue: Model Card Generation Fails
- Ensure assessment results are available
- Check template configuration
- Verify all required fields are provided

### Issue: API Returns 404
- Verify endpoint URL is correct
- Check router is enabled in backend
- Ensure proper authentication headers

---

## 🎯 **10. Success Criteria**

The platform is working correctly when you can:

1. ✅ **Upload and process datasets** through the frontend
2. ✅ **Run fairness assessments** and view detailed metrics
3. ✅ **Execute diagnosis tools** and detect drift
4. ✅ **Generate automated model cards** with assessment results
5. ✅ **Monitor job execution** through the dashboard
6. ✅ **Download evidence packs** in multiple formats
7. ✅ **View comprehensive reports** and visualizations

---

## 📞 **Need Help?**

- Check application logs: `docker-compose logs [service]`
- Review API documentation: http://localhost:8000/api/docs
- Verify all services are running: `docker-compose ps`
- Check system health: http://localhost:8000/health

Happy testing! 🎉