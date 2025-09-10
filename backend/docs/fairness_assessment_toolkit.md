# Fairness Assessment Toolkit Integration Documentation

## Overview

The Fairness Assessment Toolkit integration provides comprehensive AI fairness evaluation capabilities using the Veritas framework. This implementation includes automated fairness assessments, parameter configuration wizards, and comprehensive reporting.

## Features Implemented

### 1. Database Models
- **FairnessAssessment**: Main assessment entity with configuration and results
- **FairnessMetric**: Individual metric calculations with statistical significance
- **FairnessThreshold**: Configurable thresholds for pass/fail criteria
- **FairnessReport**: Generated reports with visualizations and recommendations

### 2. Parameter Configuration Wizard
- **5-step wizard** for guided assessment setup
- **Real-time validation** of configuration parameters
- **Protected attribute configuration** with privileged/unprivileged groups
- **Customizable thresholds** for different fairness metrics

### 3. Veritas Fairness Assessment Notebook
- **Comprehensive fairness evaluation** using AIF360 library
- **Multiple fairness metrics**:
  - Demographic Parity
  - Equal Opportunity
  - Predictive Parity
  - Equalized Odds
  - Accuracy Parity
- **Statistical significance testing** with confidence intervals
- **Visualizations** including charts and graphs

### 4. API Endpoints
- **CRUD operations** for fairness assessments
- **Assessment execution** with job system integration
- **Results visualization** with interactive dashboards
- **Report generation** in multiple formats (HTML, JSON)
- **Assessment comparison** across multiple evaluations

### 5. Job Execution Integration
- **Celery-based processing** for asynchronous execution
- **Progress tracking** with real-time updates
- **Artifact management** with MinIO storage
- **Error handling** and retry mechanisms

## Database Schema

### FairnessAssessment Table
```sql
- id: UUID (primary key)
- name: VARCHAR(255)
- description: TEXT
- status: ENUM (pending, configuring, running, completed, failed, cancelled)
- model_name: VARCHAR(255)
- model_version: VARCHAR(100)
- protected_attributes: JSON
- fairness_thresholds: JSON
- overall_fairness_score: FLOAT
- results_summary: JSON
- created_at: TIMESTAMP
- completed_at: TIMESTAMP
- created_by: UUID (foreign key to users)
- organization_id: UUID (foreign key to organizations)
```

### FairnessMetric Table
```sql
- id: UUID (primary key)
- assessment_id: UUID (foreign key)
- metric_name: VARCHAR(255)
- metric_type: ENUM (demographic_parity, equal_opportunity, etc.)
- protected_attribute: VARCHAR(255)
- metric_value: NUMERIC(10, 6)
- threshold_value: NUMERIC(10, 6)
- passed: BOOLEAN
- confidence_interval: JSON
- p_value: NUMERIC(10, 6)
- calculated_at: TIMESTAMP
```

## API Usage Examples

### 1. Create Fairness Assessment
```bash
curl -X POST "http://localhost:8000/api/v1/fairness-assessments" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Loan Approval Model Fairness Assessment",
    "model_name": "loan_approval_model",
    "model_version": "1.0.0",
    "target_column": "loan_approved",
    "protected_attributes": [
      {
        "name": "gender",
        "type": "categorical",
        "privileged_groups": ["Male"],
        "unprivileged_groups": ["Female"]
      },
      {
        "name": "race",
        "type": "categorical", 
        "privileged_groups": ["White"],
        "unprivileged_groups": ["Black", "Hispanic"]
      }
    ],
    "fairness_thresholds": [
      {
        "metric_type": "demographic_parity",
        "threshold_type": "absolute",
        "threshold_value": 0.1,
        "direction": "less_than"
      }
    ]
  }'
```

### 2. Execute Assessment
```bash
curl -X POST "http://localhost:8000/api/v1/fairness-assessments/{assessment_id}/execute" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": 0,
    "notebook_parameters": {
      "custom_param": "value"
    }
  }'
```

### 3. Get Assessment Results
```bash
curl -X GET "http://localhost:8000/api/v1/fairness-assessments/{assessment_id}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Generate Report
```bash
curl -X POST "http://localhost:8000/api/v1/fairness-assessments/{assessment_id}/reports" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "detailed",
    "include_recommendations": true,
    "include_risk_assessment": true
  }'
```

## Configuration Wizard Steps

### Step 1: Model Information
- Model name and version
- Target/prediction column
- Assessment name and description

### Step 2: Data Source
- Data source selection
- SQL query configuration
- Data validation

### Step 3: Protected Attributes
- Add protected attributes (gender, race, age, etc.)
- Define privileged and unprivileged groups
- Configure attribute types

### Step 4: Fairness Thresholds
- Set thresholds for different metrics
- Configure threshold types (absolute, relative)
- Set confidence levels

### Step 5: Advanced Settings
- Test size and random seed
- Confidence levels
- Notebook template selection

## Fairness Metrics Calculated

### 1. Demographic Parity
- **Definition**: Measures selection rate equality across groups
- **Formula**: |P(Ŷ=1|A=a) - P(Ŷ=1|A=b)|
- **Threshold**: ≤ 0.1 (absolute difference)

### 2. Equal Opportunity
- **Definition**: Measures true positive rate equality
- **Formula**: |P(Ŷ=1|Y=1,A=a) - P(Ŷ=1|Y=1,A=b)|
- **Threshold**: ≤ 0.1 (absolute difference)

### 3. Predictive Parity
- **Definition**: Measures precision equality across groups
- **Formula**: |P(Y=1|Ŷ=1,A=a) - P(Y=1|Ŷ=1,A=b)|
- **Threshold**: ≤ 0.1 (absolute difference)

### 4. Equalized Odds
- **Definition**: Combines equal opportunity and predictive parity
- **Formula**: Max(TPR difference, FPR difference)
- **Threshold**: ≤ 0.1 (absolute difference)

## Report Generation

### HTML Reports
- **Interactive dashboards** with charts and graphs
- **Executive summary** with key findings
- **Detailed metrics** with pass/fail status
- **Risk assessment** with recommendations
- **Technical appendix** with configuration details

### JSON Reports
- **Machine-readable format** for API integration
- **Structured data** for automated processing
- **Complete assessment results** with metadata

### Dashboard Integration
- **Real-time visualization** of fairness metrics
- **Trend analysis** across multiple assessments
- **Comparative analysis** between models

## Integration with Model Cards

The fairness assessment results can be automatically integrated into model cards:

- **Fairness scores** added to model card metadata
- **Assessment reports** linked as evidence
- **Compliance status** updated based on results
- **Recommendations** included in model documentation

## Error Handling and Validation

### Input Validation
- **Protected attributes** must have valid privileged/unprivileged groups
- **Threshold values** must be between 0 and 1
- **Data sources** must be accessible and valid

### Execution Monitoring
- **Progress tracking** with percentage completion
- **Error logging** with detailed messages
- **Retry mechanisms** for transient failures
- **Artifact cleanup** for temporary files

### Result Validation
- **Statistical significance** testing
- **Confidence interval** validation
- **Sample size** adequacy checking
- **Data quality** validation

## Security Considerations

- **Access control** based on user permissions
- **Data privacy** for sensitive attributes
- **Audit logging** for all assessment activities
- **Secure storage** of assessment artifacts

## Performance Optimization

- **Asynchronous processing** for long-running assessments
- **Parallel execution** of multiple metrics
- **Caching** of intermediate results
- **Resource management** for large datasets

## Future Enhancements

1. **Additional fairness frameworks** (IBM AI Fairness 360, Google Fairness Indicators)
2. **Real-time monitoring** with streaming data
3. **Automated bias mitigation** recommendations
4. **Multi-modal fairness** assessment
5. **Cross-validation** for robust fairness evaluation
6. **Explainable AI** integration for bias attribution

## Testing

Run the test suite to verify the implementation:

```bash
# Run all tests
pytest tests/test_fairness_assessment.py

# Run specific test categories
pytest tests/test_fairness_assessment.py::test_wizard_validation
pytest tests/test_fairness_assessment.py::test_metrics_calculation
pytest tests/test_fairness_assessment.py::test_report_generation
```

## Troubleshooting

### Common Issues

1. **Assessment stuck in "running" state**
   - Check Celery worker status
   - Verify notebook template accessibility
   - Review job execution logs

2. **Missing fairness metrics**
   - Verify protected attribute configuration
   - Check data quality and sample sizes
   - Review threshold configurations

3. **Report generation failures**
   - Verify template availability
   - Check data format consistency
   - Review memory and disk space

### Debug Commands

```bash
# Check Celery workers
celery -A app.celery_app inspect active

# Check database tables
psql -h localhost -U user -d database -c "\\dt fairness_*"

# View job logs
docker-compose logs celery_worker
```

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation at `/api/v1/docs`
3. Check the application logs for error details
4. Contact the development team for support