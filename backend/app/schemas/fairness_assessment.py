from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
from uuid import UUID
from app.models.fairness_assessment import (
    FairnessAssessmentStatus, 
    FairnessMetricType, 
    FairnessThresholdType
)

class ProtectedAttributeConfig(BaseModel):
    name: str = Field(..., description="Name of the protected attribute")
    type: str = Field(..., description="Data type (categorical, numerical, binary)")
    categories: Optional[List[str]] = Field(default=None, description="Categories for categorical attributes")
    privileged_groups: List[str] = Field(..., description="Privileged/reference group values")
    unprivileged_groups: List[str] = Field(..., description="Unprivileged group values")
    description: Optional[str] = Field(default=None, description="Description of the attribute")

class FairnessThresholdConfig(BaseModel):
    metric_type: FairnessMetricType = Field(..., description="Type of fairness metric")
    threshold_type: FairnessThresholdType = Field(..., description="Type of threshold")
    threshold_value: float = Field(..., ge=0, le=1, description="Threshold value")
    direction: str = Field(default="less_than", description="Direction for threshold (less_than, greater_than, equal)")
    confidence_level: float = Field(default=0.95, ge=0, le=1, description="Confidence level")
    protected_attribute: Optional[str] = Field(default=None, description="Specific protected attribute")
    subgroup: Optional[str] = Field(default=None, description="Specific subgroup")
    description: Optional[str] = Field(default=None, description="Description of the threshold")

class FairnessAssessmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    model_name: str = Field(..., description="Name of the model being assessed")
    model_version: Optional[str] = Field(None, description="Version of the model")
    model_id: Optional[UUID] = Field(None, description="UUID of the model card")
    protected_attributes: List[ProtectedAttributeConfig] = Field(..., description="Protected attributes configuration")
    target_column: str = Field(..., description="Target/prediction column name")
    fairness_thresholds: List[FairnessThresholdConfig] = Field(..., description="Fairness thresholds")
    test_size: float = Field(default=0.2, ge=0.01, le=0.9, description="Test set size")
    random_seed: Optional[int] = Field(default=None, ge=0, description="Random seed for reproducibility")
    confidence_level: float = Field(default=0.95, ge=0, le=1, description="Confidence level")
    data_source_id: Optional[UUID] = Field(default=None, description="Data source UUID")
    data_query: Optional[str] = Field(default=None, description="SQL query for data fetching")
    notebook_template: Optional[str] = Field(default="veritas_fairness", description="Notebook template to use")

class FairnessAssessmentCreate(FairnessAssessmentBase):
    pass

class FairnessAssessmentUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    protected_attributes: Optional[List[ProtectedAttributeConfig]] = None
    fairness_thresholds: Optional[List[FairnessThresholdConfig]] = None
    test_size: Optional[float] = Field(default=None, ge=0.01, le=0.9)
    random_seed: Optional[int] = Field(default=None, ge=0)
    confidence_level: Optional[float] = Field(default=None, ge=0, le=1)
    data_query: Optional[str] = None

class FairnessMetricResult(BaseModel):
    id: UUID
    metric_name: str
    metric_type: FairnessMetricType
    protected_attribute: str
    metric_value: float
    threshold_value: Optional[float]
    confidence_interval: Optional[Dict[str, float]]
    p_value: Optional[float]
    passed: bool
    failure_reason: Optional[str]
    privileged_group_value: Optional[str]
    unprivileged_group_value: Optional[str]
    privileged_metric_value: Optional[float]
    unprivileged_metric_value: Optional[float]
    sample_size: Optional[int]
    statistical_power: Optional[float]
    effect_size: Optional[float]
    calculated_at: datetime
    
    @property
    def fairness_ratio(self) -> Optional[float]:
        """Calculate fairness ratio between privileged and unprivileged groups"""
        if self.privileged_metric_value and self.unprivileged_metric_value:
            if self.privileged_metric_value != 0:
                return float(self.unprivileged_metric_value) / float(self.privileged_metric_value)
        return None
    
    @property
    def disparity(self) -> Optional[float]:
        """Calculate disparity (absolute difference)"""
        if self.privileged_metric_value and self.unprivileged_metric_value:
            return abs(float(self.privileged_metric_value) - float(self.unprivileged_metric_value))
        return None

class FairnessAssessmentInDBBase(FairnessAssessmentBase):
    id: UUID
    status: FairnessAssessmentStatus
    overall_fairness_score: Optional[float]
    results_summary: Optional[Dict[str, Any]]
    visualization_config: Optional[Dict[str, Any]]
    report_generated: bool
    report_url: Optional[str]
    narrative_summary: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[UUID]
    organization_id: Optional[UUID]
    
    class Config:
        from_attributes = True

class FairnessAssessment(FairnessAssessmentInDBBase):
    metrics: List[FairnessMetricResult] = []
    
    @property
    def is_completed(self) -> bool:
        return self.status == FairnessAssessmentStatus.COMPLETED
    
    @property
    def is_running(self) -> bool:
        return self.status == FairnessAssessmentStatus.RUNNING
    
    @property
    def is_failed(self) -> bool:
        return self.status == FairnessAssessmentStatus.FAILED
    
    @property
    def duration(self) -> Optional[float]:
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None
    
    @property
    def pass_rate(self) -> float:
        """Calculate pass rate for all metrics"""
        if not self.metrics:
            return 0.0
        passed_metrics = sum(1 for metric in self.metrics if metric.passed)
        return passed_metrics / len(self.metrics)
    
    @property
    def failed_metrics_count(self) -> int:
        """Count of failed metrics"""
        return sum(1 for metric in self.metrics if not metric.passed)

class FairnessAssessmentResponse(FairnessAssessment):
    """Extended response with computed fields"""
    duration: Optional[float] = None
    pass_rate: float = 0.0
    failed_metrics_count: int = 0
    
    @validator("duration", pre=True)
    def compute_duration(cls, v, values):
        if v is not None:
            return v
        if "started_at" in values and "completed_at" in values:
            start = values["started_at"]
            end = values["completed_at"]
            if start and end:
                return (end - start).total_seconds()
        return None

class FairnessAssessmentListResponse(BaseModel):
    assessments: List[FairnessAssessmentResponse]
    total: int
    page: int
    size: int

class FairnessAssessmentExecutionRequest(BaseModel):
    assessment_id: UUID
    notebook_parameters: Optional[Dict[str, Any]] = Field(default=None, description="Additional notebook parameters")
    priority: int = Field(default=0, ge=0, le=10)

class FairnessAssessmentConfigurationWizard(BaseModel):
    """Schema for configuration wizard step-by-step process"""
    step: int = Field(..., ge=1, le=5, description="Current step in the wizard")
    
    # Step 1: Model Information
    model_name: Optional[str] = Field(default=None, description="Model name")
    model_version: Optional[str] = Field(default=None, description="Model version")
    target_column: Optional[str] = Field(default=None, description="Target/prediction column")
    
    # Step 2: Data Source
    data_source_id: Optional[UUID] = Field(default=None, description="Data source UUID")
    data_query: Optional[str] = Field(default=None, description="SQL query")
    
    # Step 3: Protected Attributes
    protected_attributes: Optional[List[ProtectedAttributeConfig]] = None
    
    # Step 4: Fairness Thresholds
    fairness_thresholds: Optional[List[FairnessThresholdConfig]] = None
    
    # Step 5: Advanced Settings
    test_size: Optional[float] = Field(default=0.2, ge=0.01, le=0.9)
    random_seed: Optional[int] = Field(default=None, ge=0)
    confidence_level: Optional[float] = Field(default=0.95, ge=0, le=1)
    notebook_template: Optional[str] = Field(default="veritas_fairness")

class FairnessAssessmentWizardResponse(BaseModel):
    """Response from configuration wizard"""
    step: int
    completed: bool
    validation_errors: List[str] = []
    next_step_available: bool
    prev_step_available: bool
    current_configuration: Dict[str, Any] = {}

class FairnessVisualizationConfig(BaseModel):
    """Configuration for fairness visualizations"""
    chart_type: str = Field(..., description="Type of chart (bar, line, scatter, heatmap)")
    title: str = Field(..., description="Chart title")
    x_axis: str = Field(..., description="X-axis label")
    y_axis: str = Field(..., description="Y-axis label")
    data: Dict[str, Any] = Field(..., description="Chart data")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")

class FairnessReportRequest(BaseModel):
    """Request for generating fairness reports"""
    assessment_id: UUID
    report_type: str = Field(..., description="Type of report (summary, detailed, executive)")
    title: Optional[str] = Field(default=None, description="Custom report title")
    include_recommendations: bool = Field(default=True)
    include_risk_assessment: bool = Field(default=True)
    visualization_configs: Optional[List[FairnessVisualizationConfig]] = None

class FairnessReportResponse(BaseModel):
    """Response for fairness report generation"""
    report_id: UUID
    report_url: Optional[str]
    data_export_url: Optional[str]
    visualizations_url: Optional[str]
    status: str
    estimated_completion_time: Optional[datetime]

class FairnessMetricComparison(BaseModel):
    """Schema for comparing fairness metrics across assessments"""
    assessment_id: UUID
    assessment_name: str
    metrics: List[FairnessMetricResult]
    overall_fairness_score: Optional[float]
    created_at: datetime

class FairnessComparisonResponse(BaseModel):
    """Response for fairness comparison"""
    assessments: List[FairnessMetricComparison]
    comparison_summary: Dict[str, Any]
    trends: Dict[str, Any]