from sqlalchemy import Column, String, Text, DateTime, Boolean, JSON, UUID, ForeignKey, Integer, Enum, Float, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum

class FairnessAssessmentStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIGURING = "configuring"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class FairnessMetricType(str, enum.Enum):
    DEMOGRAPHIC_PARITY = "demographic_parity"
    EQUAL_OPPORTUNITY = "equal_opportunity"
    EQUALIZED_ODDS = "equalized_odds"
    PREDICTIVE_PARITY = "predictive_parity"
    ACCURACY_PARITY = "accuracy_parity"
    TREATMENT_EQUALITY = "treatment_equality"
    STATISTICAL_PARITY = "statistical_parity"
    OVERALL_ACCURACY = "overall_accuracy"
    AUC_ROC = "auc_roc"
    PRECISION = "precision"
    RECALL = "recall"
    F1_SCORE = "f1_score"

class FairnessThresholdType(str, enum.Enum):
    ABSOLUTE = "absolute"
    RELATIVE = "relative"
    CUSTOM = "custom"

class FairnessAssessment(Base):
    __tablename__ = "fairness_assessments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(FairnessAssessmentStatus), nullable=False, default=FairnessAssessmentStatus.PENDING)
    
    # Model information
    model_name = Column(String(255), nullable=False)
    model_version = Column(String(100))
    model_id = Column(UUID(as_uuid=True), ForeignKey("model_cards.id"))
    
    # Protected attributes configuration
    protected_attributes = Column(JSON, nullable=False)  # List of protected attribute configurations
    reference_groups = Column(JSON)  # Reference/privileged groups for each protected attribute
    target_column = Column(String(255), nullable=False)  # Target/prediction column
    
    # Assessment configuration
    fairness_thresholds = Column(JSON)  # Thresholds for different fairness metrics
    test_size = Column(Float, default=0.2)  # Test set size for evaluation
    random_seed = Column(Integer)  # Random seed for reproducibility
    confidence_level = Column(Float, default=0.95)  # Confidence level for statistical tests
    
    # Data source configuration
    data_source_id = Column(UUID(as_uuid=True), ForeignKey("data_sources.id"))
    data_query = Column(Text)  # SQL query to fetch data for assessment
    
    # Notebook execution
    notebook_template = Column(String(255))  # Template notebook to use
    notebook_parameters = Column(JSON)  # Parameters for notebook execution
    execution_job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"))
    
    # Results
    overall_fairness_score = Column(Float)  # Overall fairness score (0-1)
    results_summary = Column(JSON)  # Summary of assessment results
    visualization_config = Column(JSON)  # Configuration for visualizations
    
    # Report generation
    report_generated = Column(Boolean, default=False)
    report_url = Column(String(500))  # URL to generated report
    narrative_summary = Column(Text)  # AI-generated narrative summary
    
    # Timing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # User and organization
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    
    # Relationships
    model_card = relationship("ModelCard", backref="fairness_assessments")
    data_source = relationship("DataSource", backref="fairness_assessments")
    execution_job = relationship("Job", backref="fairness_assessment")
    user = relationship("User", backref="fairness_assessments")
    organization = relationship("Organization", backref="fairness_assessments")
    metrics = relationship("FairnessAssessmentMetric", backref="assessment", cascade="all, delete-orphan")
    thresholds = relationship("FairnessThreshold", backref="assessment", cascade="all, delete-orphan")
    
    @property
    def is_completed(self):
        return self.status == FairnessAssessmentStatus.COMPLETED
    
    @property
    def is_running(self):
        return self.status == FairnessAssessmentStatus.RUNNING
    
    @property
    def is_failed(self):
        return self.status == FairnessAssessmentStatus.FAILED
    
    @property
    def duration(self):
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None

class FairnessAssessmentMetric(Base):
    __tablename__ = "fairness_assessment_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("fairness_assessments.id"), nullable=False)
    
    # Metric information
    metric_name = Column(String(255), nullable=False)
    metric_type = Column(Enum(FairnessMetricType), nullable=False)
    protected_attribute = Column(String(255), nullable=False)  # Protected attribute name
    
    # Metric values
    metric_value = Column(Numeric(10, 6), nullable=False)  # Calculated metric value
    threshold_value = Column(Numeric(10, 6))  # Threshold for pass/fail
    confidence_interval = Column(JSON)  # Confidence interval for the metric
    p_value = Column(Numeric(10, 6))  # P-value for statistical significance
    
    # Pass/fail status
    passed = Column(Boolean, nullable=False)  # Whether the metric passed the threshold
    failure_reason = Column(Text)  # Reason for failure if applicable
    
    # Subgroup breakdowns
    privileged_group_value = Column(String(255))  # Value of privileged group
    unprivileged_group_value = Column(String(255))  # Value of unprivileged group
    privileged_metric_value = Column(Numeric(10, 6))  # Metric value for privileged group
    unprivileged_metric_value = Column(Numeric(10, 6))  # Metric value for unprivileged group
    
    # Additional metadata
    sample_size = Column(Integer)  # Sample size used for calculation
    statistical_power = Column(Float)  # Statistical power of the test
    effect_size = Column(Numeric(10, 6))  # Effect size
    
    # Timing
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    @property
    def fairness_ratio(self):
        """Calculate fairness ratio between privileged and unprivileged groups"""
        if self.privileged_metric_value and self.unprivileged_metric_value:
            if self.privileged_metric_value != 0:
                return float(self.unprivileged_metric_value) / float(self.privileged_metric_value)
        return None
    
    @property
    def disparity(self):
        """Calculate disparity (absolute difference)"""
        if self.privileged_metric_value and self.unprivileged_metric_value:
            return abs(float(self.privileged_metric_value) - float(self.unprivileged_metric_value))
        return None

class FairnessThreshold(Base):
    __tablename__ = "fairness_thresholds"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("fairness_assessments.id"), nullable=False)
    
    # Threshold configuration
    metric_type = Column(Enum(FairnessMetricType), nullable=False)
    threshold_type = Column(Enum(FairnessThresholdType), nullable=False)
    threshold_value = Column(Numeric(10, 6), nullable=False)
    
    # Advanced threshold configuration
    direction = Column(String(10), default="less_than")  # "less_than", "greater_than", "equal"
    confidence_level = Column(Float, default=0.95)  # Confidence level for threshold
    
    # Scope
    protected_attribute = Column(String(255))  # Specific protected attribute (optional)
    subgroup = Column(String(255))  # Specific subgroup (optional)
    
    # Metadata
    description = Column(Text)
    is_custom = Column(Boolean, default=False)  # Whether this is a custom threshold
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    @property
    def threshold_direction(self):
        """Get threshold direction as a readable format"""
        return {
            "less_than": "≤",
            "greater_than": "≥",
            "equal": "="
        }.get(self.direction, self.direction)

class FairnessReport(Base):
    __tablename__ = "fairness_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("fairness_assessments.id"), nullable=False)
    
    # Report information
    report_type = Column(String(100), nullable=False)  # "summary", "detailed", "executive"
    title = Column(String(255), nullable=False)
    subtitle = Column(String(500))
    
    # Report content
    summary_findings = Column(JSON)  # Key findings and insights
    recommendations = Column(JSON)  # Recommendations for improvement
    risk_assessment = Column(JSON)  # Risk assessment based on fairness metrics
    
    # Visualization data
    charts = Column(JSON)  # Chart configurations and data
    dashboard_config = Column(JSON)  # Interactive dashboard configuration
    
    # Report files
    report_url = Column(String(500))  # URL to generated report PDF/HTML
    data_export_url = Column(String(500))  # URL to exported data
    visualizations_url = Column(String(500))  # URL to visualization assets
    
    # Metadata
    generated_by = Column(String(255))  # "auto", "manual", "scheduled"
    template_version = Column(String(50))  # Version of report template used
    
    # Timing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    assessment = relationship("FairnessAssessment", backref="reports")
    
    @property
    def report_status(self):
        """Get report status based on URLs"""
        if self.report_url:
            return "completed"
        elif self.assessment.is_completed:
            return "ready_for_generation"
        else:
            return "pending"