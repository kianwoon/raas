from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, validator
from app.models.diagnosis_assessment import (
    DiagnosisAssessmentStatus,
    DiagnosisMetricType,
    DriftDetectionType,
    ExplainabilityMethod
)

# Base schemas
class DiagnosisAssessmentBase(BaseModel):
    name: str = Field(..., description="Name of the diagnosis assessment")
    description: Optional[str] = Field(None, description="Description of the diagnosis assessment")
    model_name: str = Field(..., description="Name of the model being diagnosed")
    model_version: Optional[str] = Field(None, description="Version of the model")
    model_id: Optional[UUID] = Field(None, description="Reference to the model card")
    
    # Assessment configuration
    diagnosis_types: List[str] = Field(..., description="Types of diagnosis to run")
    performance_metrics: Optional[List[str]] = Field(None, description="Performance metrics to calculate")
    drift_detection_config: Optional[Dict[str, Any]] = Field(None, description="Drift detection configuration")
    explainability_config: Optional[Dict[str, Any]] = Field(None, description="Explainability configuration")
    
    # Data source configuration
    data_source_id: Optional[UUID] = Field(None, description="Data source for assessment")
    baseline_data_source_id: Optional[UUID] = Field(None, description="Baseline data source for drift detection")
    data_query: Optional[str] = Field(None, description="SQL query to fetch data")
    
    # Assessment parameters
    test_size: float = Field(0.2, ge=0.01, le=0.99, description="Test set size for evaluation")
    random_seed: Optional[int] = Field(None, description="Random seed for reproducibility")
    confidence_level: float = Field(0.95, ge=0.5, le=1.0, description="Confidence level for statistical tests")
    
    # Drift detection parameters
    drift_threshold: float = Field(0.1, ge=0.0, le=1.0, description="Threshold for drift detection")
    drift_significance_level: float = Field(0.05, ge=0.01, le=0.1, description="Significance level for statistical tests")
    
    # Explainability parameters
    explainability_samples: int = Field(1000, ge=100, le=10000, description="Number of samples for explainability")
    explainability_background_size: int = Field(100, ge=10, le=1000, description="Background sample size")
    
    # Notebook execution
    notebook_template: Optional[str] = Field(None, description="Template notebook to use")
    notebook_parameters: Optional[Dict[str, Any]] = Field(None, description="Parameters for notebook execution")

class DiagnosisAssessmentCreate(DiagnosisAssessmentBase):
    pass

class DiagnosisAssessmentUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the diagnosis assessment")
    description: Optional[str] = Field(None, description="Description of the diagnosis assessment")
    diagnosis_types: Optional[List[str]] = Field(None, description="Types of diagnosis to run")
    performance_metrics: Optional[List[str]] = Field(None, description="Performance metrics to calculate")
    drift_detection_config: Optional[Dict[str, Any]] = Field(None, description="Drift detection configuration")
    explainability_config: Optional[Dict[str, Any]] = Field(None, description="Explainability configuration")
    data_source_id: Optional[UUID] = Field(None, description="Data source for assessment")
    baseline_data_source_id: Optional[UUID] = Field(None, description="Baseline data source for drift detection")
    data_query: Optional[str] = Field(None, description="SQL query to fetch data")
    test_size: Optional[float] = Field(None, ge=0.01, le=0.99, description="Test set size for evaluation")
    random_seed: Optional[int] = Field(None, description="Random seed for reproducibility")
    confidence_level: Optional[float] = Field(None, ge=0.5, le=1.0, description="Confidence level for statistical tests")
    drift_threshold: Optional[float] = Field(None, ge=0.0, le=1.0, description="Threshold for drift detection")
    drift_significance_level: Optional[float] = Field(None, ge=0.01, le=0.1, description="Significance level for statistical tests")
    explainability_samples: Optional[int] = Field(None, ge=100, le=10000, description="Number of samples for explainability")
    explainability_background_size: Optional[int] = Field(None, ge=10, le=1000, description="Background sample size")
    notebook_template: Optional[str] = Field(None, description="Template notebook to use")
    notebook_parameters: Optional[Dict[str, Any]] = Field(None, description="Parameters for notebook execution")

class DiagnosisAssessmentResponse(DiagnosisAssessmentBase):
    id: UUID = Field(..., description="Unique identifier for the assessment")
    status: DiagnosisAssessmentStatus = Field(..., description="Current status of the assessment")
    created_at: datetime = Field(..., description="Timestamp when the assessment was created")
    updated_at: Optional[datetime] = Field(None, description="Timestamp when the assessment was last updated")
    started_at: Optional[datetime] = Field(None, description="Timestamp when the assessment was started")
    completed_at: Optional[datetime] = Field(None, description="Timestamp when the assessment was completed")
    created_by: UUID = Field(..., description="User who created the assessment")
    organization_id: UUID = Field(..., description="Organization ID")
    
    # Results
    overall_performance_score: Optional[float] = Field(None, description="Overall performance score")
    drift_detected: bool = Field(False, description="Whether drift was detected")
    explainability_insights: Optional[Dict[str, Any]] = Field(None, description="Explainability insights")
    
    # Report information
    report_generated: bool = Field(False, description="Whether report has been generated")
    report_url: Optional[str] = Field(None, description="URL to generated report")
    executive_summary: Optional[str] = Field(None, description="Executive summary")
    technical_summary: Optional[str] = Field(None, description="Technical summary")
    
    # Execution information
    execution_job_id: Optional[UUID] = Field(None, description="Job ID for execution")
    
    class Config:
        from_attributes = True

class DiagnosisAssessmentListResponse(BaseModel):
    assessments: List[DiagnosisAssessmentResponse] = Field(..., description="List of assessments")
    total: int = Field(..., description="Total number of assessments")
    page: int = Field(..., description="Current page number")
    size: int = Field(..., description="Number of assessments per page")

# Execution request
class DiagnosisAssessmentExecutionRequest(BaseModel):
    assessment_id: UUID = Field(..., description="ID of the assessment to execute")
    execution_parameters: Optional[Dict[str, Any]] = Field(None, description="Additional execution parameters")
    priority: int = Field(0, description="Job priority")
    max_retries: int = Field(3, description="Maximum number of retries")

# Configuration wizard
class DiagnosisAssessmentConfigurationWizard(BaseModel):
    step: int = Field(..., ge=1, le=5, description="Current wizard step")
    assessment_id: Optional[UUID] = Field(None, description="Assessment ID for existing assessment")
    
    # Step 1: Basic information
    name: Optional[str] = Field(None, description="Name of the assessment")
    description: Optional[str] = Field(None, description="Description of the assessment")
    model_name: Optional[str] = Field(None, description="Name of the model")
    model_version: Optional[str] = Field(None, description="Version of the model")
    model_id: Optional[UUID] = Field(None, description="Model card reference")
    
    # Step 2: Diagnosis types
    diagnosis_types: Optional[List[str]] = Field(None, description="Types of diagnosis to run")
    
    # Step 3: Data sources
    data_source_id: Optional[UUID] = Field(None, description="Data source for assessment")
    baseline_data_source_id: Optional[UUID] = Field(None, description="Baseline data source")
    data_query: Optional[str] = Field(None, description="SQL query for data")
    
    # Step 4: Configuration
    performance_metrics: Optional[List[str]] = Field(None, description="Performance metrics")
    drift_detection_config: Optional[Dict[str, Any]] = Field(None, description="Drift detection config")
    explainability_config: Optional[Dict[str, Any]] = Field(None, description="Explainability config")
    
    # Step 5: Parameters
    test_size: Optional[float] = Field(None, ge=0.01, le=0.99)
    random_seed: Optional[int] = Field(None)
    confidence_level: Optional[float] = Field(None, ge=0.5, le=1.0)
    drift_threshold: Optional[float] = Field(None, ge=0.0, le=1.0)
    explainability_samples: Optional[int] = Field(None, ge=100, le=10000)
    
    # Navigation
    action: str = Field(..., description="Wizard action: 'next', 'previous', 'save', 'execute'")

class DiagnosisAssessmentWizardResponse(BaseModel):
    step: int = Field(..., description="Current wizard step")
    assessment_id: Optional[UUID] = Field(None, description="Assessment ID if created")
    completed: bool = Field(False, description="Whether wizard is completed")
    
    # Form data
    form_data: Dict[str, Any] = Field(..., description="Current form data")
    
    # Validation
    validation_errors: List[str] = Field([], description="Validation errors")
    
    # Next steps
    next_step: Optional[int] = Field(None, description="Next wizard step")
    can_proceed: bool = Field(True, description="Whether user can proceed to next step")
    
    # Preview
    preview_data: Optional[Dict[str, Any]] = Field(None, description="Preview of assessment configuration")

# Report generation
class DiagnosisReportRequest(BaseModel):
    assessment_id: UUID = Field(..., description="ID of the assessment")
    report_type: str = Field(..., description="Type of report: 'summary', 'detailed', 'executive', 'technical'")
    title: Optional[str] = Field(None, description="Custom report title")
    include_charts: bool = Field(True, description="Include charts in report")
    include_recommendations: bool = Field(True, description="Include recommendations")
    include_risk_assessment: bool = Field(True, description="Include risk assessment")
    template_version: Optional[str] = Field(None, description="Template version to use")

class DiagnosisReportResponse(BaseModel):
    report_id: UUID = Field(..., description="ID of the generated report")
    report_url: Optional[str] = Field(None, description="URL to generated report")
    data_export_url: Optional[str] = Field(None, description="URL to exported data")
    visualizations_url: Optional[str] = Field(None, description="URL to visualization assets")
    status: str = Field(..., description="Report generation status")
    estimated_completion_time: Optional[datetime] = Field(None, description="Estimated completion time")

# Visualization
class DiagnosisVisualizationConfig(BaseModel):
    chart_type: str = Field(..., description="Type of chart")
    title: str = Field(..., description="Chart title")
    data: Dict[str, Any] = Field(..., description="Chart data")
    options: Optional[Dict[str, Any]] = Field(None, description="Chart options")
    width: Optional[int] = Field(None, description="Chart width")
    height: Optional[int] = Field(None, description="Chart height")

# Metrics
class DiagnosisMetricResponse(BaseModel):
    id: UUID = Field(..., description="Metric ID")
    metric_name: str = Field(..., description="Name of the metric")
    metric_type: DiagnosisMetricType = Field(..., description="Type of metric")
    dataset_type: str = Field(..., description="Dataset type")
    metric_value: float = Field(..., description="Calculated metric value")
    baseline_value: Optional[float] = Field(None, description="Baseline value")
    confidence_interval: Optional[Dict[str, float]] = Field(None, description="Confidence interval")
    threshold_min: Optional[float] = Field(None, description="Minimum threshold")
    threshold_max: Optional[float] = Field(None, description="Maximum threshold")
    passed: bool = Field(..., description="Whether metric passed threshold")
    degradation_detected: bool = Field(False, description="Whether degradation was detected")
    sample_size: Optional[int] = Field(None, description="Sample size")
    additional_metrics: Optional[Dict[str, Any]] = Field(None, description="Additional metrics")
    calculated_at: datetime = Field(..., description="Calculation timestamp")

class DriftDetectionResponse(BaseModel):
    id: UUID = Field(..., description="Drift detection ID")
    feature_name: str = Field(..., description="Feature name")
    drift_type: DriftDetectionType = Field(..., description="Type of drift detection")
    dataset_type: str = Field(..., description="Dataset type")
    drift_score: float = Field(..., description="Calculated drift score")
    drift_threshold: float = Field(..., description="Drift threshold")
    p_value: Optional[float] = Field(None, description="P-value")
    drift_detected: bool = Field(..., description="Whether drift was detected")
    drift_severity: str = Field(..., description="Drift severity")
    drift_direction: str = Field(..., description="Drift direction")
    baseline_stats: Optional[Dict[str, Any]] = Field(None, description="Baseline statistics")
    current_stats: Optional[Dict[str, Any]] = Field(None, description="Current statistics")
    feature_type: Optional[str] = Field(None, description="Feature type")
    calculated_at: datetime = Field(..., description="Calculation timestamp")

class ExplainabilityResultResponse(BaseModel):
    id: UUID = Field(..., description="Explainability result ID")
    method: ExplainabilityMethod = Field(..., description="Explainability method")
    feature_name: Optional[str] = Field(None, description="Feature name")
    instance_id: Optional[str] = Field(None, description="Instance ID")
    explanation_score: Optional[float] = Field(None, description="Explanation score")
    key_insights: Optional[List[str]] = Field(None, description="Key insights")
    interpretation: Optional[str] = Field(None, description="Interpretation")
    recommendations: Optional[List[str]] = Field(None, description="Recommendations")
    sample_size: Optional[int] = Field(None, description="Sample size")
    calculated_at: datetime = Field(..., description="Calculation timestamp")

# Comparison
class DiagnosisComparison(BaseModel):
    assessment_id: UUID = Field(..., description="Assessment ID")
    assessment_name: str = Field(..., description="Assessment name")
    performance_score: Optional[float] = Field(None, description="Overall performance score")
    drift_detected: bool = Field(False, description="Whether drift was detected")
    total_metrics: int = Field(0, description="Total number of metrics")
    passed_metrics: int = Field(0, description="Number of passed metrics")
    created_at: datetime = Field(..., description="Creation timestamp")

class DiagnosisComparisonResponse(BaseModel):
    assessments: List[DiagnosisComparison] = Field(..., description="List of assessments to compare")
    comparison_summary: Dict[str, Any] = Field(..., description="Comparison summary")
    trends: Optional[Dict[str, Any]] = Field(None, description="Trends over time")

# Templates
class DiagnosisTemplate(BaseModel):
    id: str = Field(..., description="Template ID")
    name: str = Field(..., description="Template name")
    description: str = Field(..., description="Template description")
    diagnosis_types: List[str] = Field(..., description="Supported diagnosis types")
    performance_metrics: List[str] = Field(..., description="Supported performance metrics")
    drift_detection_methods: List[str] = Field(..., description="Supported drift detection methods")
    explainability_methods: List[str] = Field(..., description="Supported explainability methods")
    notebook_template: str = Field(..., description="Notebook template filename")
    configuration: Dict[str, Any] = Field(..., description="Template configuration")

# Inference monitoring
class InferenceMonitoringConfig(BaseModel):
    model_name: str = Field(..., description="Model name")
    model_version: Optional[str] = Field(None, description="Model version")
    endpoint_url: str = Field(..., description="Model inference endpoint")
    sample_rate: float = Field(0.1, ge=0.01, le=1.0, description="Sampling rate")
    batch_size: int = Field(100, ge=10, le=1000, description="Batch size")
    alert_thresholds: Dict[str, float] = Field(..., description="Alert thresholds")
    alert_contacts: List[str] = Field(..., description="Alert contacts")

class InferenceMonitoringResponse(BaseModel):
    id: UUID = Field(..., description="Monitoring ID")
    model_name: str = Field(..., description="Model name")
    monitoring_enabled: bool = Field(..., description="Whether monitoring is enabled")
    total_inferences: int = Field(..., description="Total inferences processed")
    last_inference_time: Optional[datetime] = Field(None, description="Last inference time")
    average_latency: Optional[float] = Field(None, description="Average latency")
    error_rate: Optional[float] = Field(None, description="Error rate")
    monitoring_status: str = Field(..., description="Monitoring status")
    last_check_time: Optional[datetime] = Field(None, description="Last check time")
    next_check_time: Optional[datetime] = Field(None, description="Next check time")

# Statistics
class DiagnosisStatistics(BaseModel):
    total_assessments: int = Field(..., description="Total number of assessments")
    completed_assessments: int = Field(..., description="Number of completed assessments")
    failed_assessments: int = Field(..., description="Number of failed assessments")
    average_performance_score: Optional[float] = Field(None, description="Average performance score")
    assessments_with_drift: int = Field(..., description="Number of assessments with drift detected")
    average_duration: Optional[float] = Field(None, description="Average assessment duration in seconds")
    popular_diagnosis_types: List[str] = Field(..., description="Most popular diagnosis types")
    recent_assessments: List[DiagnosisAssessmentResponse] = Field(..., description="Recent assessments")