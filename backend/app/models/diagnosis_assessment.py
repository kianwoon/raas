from sqlalchemy import Column, String, Text, DateTime, Boolean, JSON, UUID, ForeignKey, Integer, Enum, Float, Numeric, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum

class DiagnosisAssessmentStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIGURING = "configuring"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class DiagnosisMetricType(str, enum.Enum):
    ACCURACY = "accuracy"
    PRECISION = "precision"
    RECALL = "recall"
    F1_SCORE = "f1_score"
    AUC_ROC = "auc_roc"
    AUC_PR = "auc_pr"
    LOG_LOSS = "log_loss"
    MSE = "mse"
    MAE = "mae"
    RMSE = "rmse"
    R2_SCORE = "r2_score"
    CALIBRATION_ERROR = "calibration_error"
    BRIER_SCORE = "brier_score"
    CONFUSION_MATRIX = "confusion_matrix"
    CLASSIFICATION_REPORT = "classification_report"

class DriftDetectionType(str, enum.Enum):
    POPULATION_STABILITY_INDEX = "psi"
    KL_DIVERGENCE = "kl_divergence"
    JS_DIVERGENCE = "js_divergence"
    WASSERSTEIN_DISTANCE = "wasserstein_distance"
    KOLMOGOROV_SMIRNOV = "kolmogorov_smirnov"
    CHI_SQUARE = "chi_square"
    CRAMERS_V = "cramers_v"
    DRIFT_SCORE = "drift_score"

class ExplainabilityMethod(str, enum.Enum):
    SHAP = "shap"
    LIME = "lime"
    PDP = "partial_dependence_plot"
    ICE = "individual_conditional_expectation"
    ALE = "accumulated_local_effects"
    ANOVA = "anova"
    PERMUTATION_IMPORTANCE = "permutation_importance"
    FEATURE_IMPORTANCE = "feature_importance"
    COUNTERFACTUAL = "counterfactual"

class DiagnosisAssessment(Base):
    __tablename__ = "diagnosis_assessments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(DiagnosisAssessmentStatus), nullable=False, default=DiagnosisAssessmentStatus.PENDING)
    
    # Model information
    model_name = Column(String(255), nullable=False)
    model_version = Column(String(100))
    model_id = Column(UUID(as_uuid=True), ForeignKey("model_cards.id"))
    
    # Assessment configuration
    diagnosis_types = Column(JSON, nullable=False)  # List of diagnosis types to run
    performance_metrics = Column(JSON)  # Performance metrics to calculate
    drift_detection_config = Column(JSON)  # Drift detection configuration
    explainability_config = Column(JSON)  # Explainability configuration
    
    # Data source configuration
    data_source_id = Column(UUID(as_uuid=True), ForeignKey("data_sources.id"))
    baseline_data_source_id = Column(UUID(as_uuid=True), ForeignKey("data_sources.id"))  # For drift detection
    data_query = Column(Text)  # SQL query to fetch data for assessment
    
    # Assessment parameters
    test_size = Column(Float, default=0.2)  # Test set size for evaluation
    random_seed = Column(Integer)  # Random seed for reproducibility
    confidence_level = Column(Float, default=0.95)  # Confidence level for statistical tests
    
    # Drift detection specific parameters
    drift_threshold = Column(Float, default=0.1)  # Threshold for drift detection
    drift_significance_level = Column(Float, default=0.05)  # Significance level for statistical tests
    
    # Explainability specific parameters
    explainability_samples = Column(Integer, default=1000)  # Number of samples for explainability
    explainability_background_size = Column(Integer, default=100)  # Background sample size
    
    # Notebook execution
    notebook_template = Column(String(255))  # Template notebook to use
    notebook_parameters = Column(JSON)  # Parameters for notebook execution
    execution_job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"))
    
    # Results summary
    overall_performance_score = Column(Float)  # Overall performance score (0-1)
    drift_detected = Column(Boolean, default=False)  # Whether drift was detected
    explainability_insights = Column(JSON)  # Key insights from explainability
    
    # Report generation
    report_generated = Column(Boolean, default=False)
    report_url = Column(String(500))  # URL to generated report
    executive_summary = Column(Text)  # AI-generated executive summary
    technical_summary = Column(Text)  # Technical summary
    
    # Timing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # User and organization
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    
    # Relationships
    model_card = relationship("ModelCard", backref="diagnosis_assessments")
    data_source = relationship("DataSource", backref="diagnosis_assessments", foreign_keys=[data_source_id])
    baseline_data_source = relationship("DataSource", backref="diagnosis_assessments_baseline", foreign_keys=[baseline_data_source_id])
    execution_job = relationship("Job", backref="diagnosis_assessment")
    user = relationship("User", backref="diagnosis_assessments")
    organization = relationship("Organization", backref="diagnosis_assessments")
    performance_metrics = relationship("DiagnosisMetric", backref="assessment", cascade="all, delete-orphan")
    drift_results = relationship("DriftDetection", backref="assessment", cascade="all, delete-orphan")
    explainability_results = relationship("ExplainabilityResult", backref="assessment", cascade="all, delete-orphan")
    
    @property
    def is_completed(self):
        return self.status == DiagnosisAssessmentStatus.COMPLETED
    
    @property
    def is_running(self):
        return self.status == DiagnosisAssessmentStatus.RUNNING
    
    @property
    def is_failed(self):
        return self.status == DiagnosisAssessmentStatus.FAILED
    
    @property
    def duration(self):
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None
    
    @property
    def has_drift(self):
        """Check if any drift was detected"""
        return any(result.drift_detected for result in self.drift_results)

class DiagnosisMetric(Base):
    __tablename__ = "diagnosis_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("diagnosis_assessments.id"), nullable=False)
    
    # Metric information
    metric_name = Column(String(255), nullable=False)
    metric_type = Column(Enum(DiagnosisMetricType), nullable=False)
    dataset_type = Column(String(50), nullable=False)  # "training", "validation", "test", "production"
    
    # Metric values
    metric_value = Column(Numeric(10, 6), nullable=False)  # Calculated metric value
    baseline_value = Column(Numeric(10, 6))  # Baseline value for comparison
    confidence_interval = Column(JSON)  # Confidence interval for the metric
    standard_error = Column(Numeric(10, 6))  # Standard error
    
    # Pass/fail criteria
    threshold_min = Column(Numeric(10, 6))  # Minimum acceptable value
    threshold_max = Column(Numeric(10, 6))  # Maximum acceptable value
    passed = Column(Boolean, nullable=False)  # Whether the metric passed the threshold
    degradation_detected = Column(Boolean, default=False)  # Whether degradation from baseline was detected
    
    # Additional information
    sample_size = Column(Integer)  # Sample size used for calculation
    additional_metrics = Column(JSON)  # Additional metrics (e.g., confusion matrix, classification report)
    
    # Timing
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    @property
    def degradation(self):
        """Calculate degradation from baseline"""
        if self.baseline_value and self.metric_value:
            return float(self.baseline_value) - float(self.metric_value)
        return None
    
    @property
    def degradation_percentage(self):
        """Calculate degradation percentage from baseline"""
        if self.baseline_value and self.metric_value and self.baseline_value != 0:
            return (float(self.baseline_value) - float(self.metric_value)) / float(self.baseline_value) * 100
        return None

class DriftDetection(Base):
    __tablename__ = "drift_detections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("diagnosis_assessments.id"), nullable=False)
    
    # Drift detection information
    feature_name = Column(String(255), nullable=False)  # Feature or column name
    drift_type = Column(Enum(DriftDetectionType), nullable=False)  # Type of drift detection used
    dataset_type = Column(String(50), nullable=False)  # "training", "validation", "test", "production"
    
    # Drift metrics
    drift_score = Column(Numeric(10, 6), nullable=False)  # Calculated drift score
    drift_threshold = Column(Numeric(10, 6), nullable=False)  # Threshold for drift detection
    p_value = Column(Numeric(10, 6))  # P-value for statistical significance
    confidence_interval = Column(JSON)  # Confidence interval for drift score
    
    # Drift detection results
    drift_detected = Column(Boolean, nullable=False)  # Whether drift was detected
    drift_severity = Column(String(20))  # "low", "medium", "high"
    drift_direction = Column(String(20))  # "increasing", "decreasing", "distributional"
    
    # Statistical information
    baseline_stats = Column(JSON)  # Baseline distribution statistics
    current_stats = Column(JSON)  # Current distribution statistics
    sample_size_baseline = Column(Integer)  # Sample size for baseline
    sample_size_current = Column(Integer)  # Sample size for current data
    
    # Additional information
    feature_type = Column(String(50))  # "numerical", "categorical", "datetime"
    feature_importance = Column(Numeric(10, 6))  # Feature importance score
    
    # Timing
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    @property
    def drift_magnitude(self):
        """Get drift magnitude based on drift score and threshold"""
        if self.drift_score and self.drift_threshold:
            ratio = float(self.drift_score) / float(self.drift_threshold)
            if ratio < 1.5:
                return "low"
            elif ratio < 2.0:
                return "medium"
            else:
                return "high"
        return "unknown"

class ExplainabilityResult(Base):
    __tablename__ = "explainability_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("diagnosis_assessments.id"), nullable=False)
    
    # Explainability information
    method = Column(Enum(ExplainabilityMethod), nullable=False)  # Explainability method used
    feature_name = Column(String(255))  # Specific feature (if applicable)
    instance_id = Column(String(255))  # Specific instance (if applicable)
    
    # Explainability results
    explanation_data = Column(JSON, nullable=False)  # Raw explanation data
    feature_importance = Column(JSON)  # Feature importance scores
    explanation_score = Column(Numeric(10, 6))  # Explanation score or importance
    
    # Visualization data
    visualization_data = Column(JSON)  # Data for visualizations
    plot_data = Column(JSON)  # Plot-specific data
    
    # Insights and interpretation
    key_insights = Column(JSON)  # Key insights from the explanation
    interpretation = Column(Text)  # Interpretation of the explanation
    recommendations = Column(JSON)  # Recommendations based on explanation
    
    # Additional information
    sample_size = Column(Integer)  # Number of samples used
    background_size = Column(Integer)  # Background sample size
    model_type = Column(String(100))  # Type of model explained
    
    # Timing
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    @property
    def top_features(self):
        """Get top features by importance"""
        if self.feature_importance:
            sorted_features = sorted(self.feature_importance.items(), key=lambda x: x[1], reverse=True)
            return sorted_features[:10]  # Return top 10 features
        return []

class DiagnosisReport(Base):
    __tablename__ = "diagnosis_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("diagnosis_assessments.id"), nullable=False)
    
    # Report information
    report_type = Column(String(100), nullable=False)  # "summary", "detailed", "executive", "technical"
    title = Column(String(255), nullable=False)
    subtitle = Column(String(500))
    
    # Report content
    executive_summary = Column(Text)  # Executive summary for stakeholders
    technical_summary = Column(Text)  # Technical summary for data scientists
    key_findings = Column(JSON)  # Key findings and insights
    recommendations = Column(JSON)  # Recommendations for improvement
    risk_assessment = Column(JSON)  # Risk assessment based on diagnosis results
    
    # Performance section
    performance_summary = Column(JSON)  # Summary of performance metrics
    performance_insights = Column(JSON)  # Insights about performance
    
    # Drift section
    drift_summary = Column(JSON)  # Summary of drift detection results
    drift_insights = Column(JSON)  # Insights about drift
    
    # Explainability section
    explainability_summary = Column(JSON)  # Summary of explainability results
    explainability_insights = Column(JSON)  # Insights about explainability
    
    # Visualization data
    charts = Column(JSON)  # Chart configurations and data
    dashboard_config = Column(JSON)  # Interactive dashboard configuration
    
    # Report files
    report_url = Column(String(500))  # URL to generated report PDF/HTML
    data_export_url = Column(String(500))  # URL to exported data
    visualizations_url = Column(String(500))  # URL to visualization assets
    
    # Model card integration
    model_card_updates = Column(JSON)  # Suggested updates for model card
    
    # Metadata
    generated_by = Column(String(255))  # "auto", "manual", "scheduled"
    template_version = Column(String(50))  # Version of report template used
    
    # Timing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    assessment = relationship("DiagnosisAssessment", backref="reports")
    
    @property
    def report_status(self):
        """Get report status based on URLs"""
        if self.report_url:
            return "completed"
        elif self.assessment.is_completed:
            return "ready_for_generation"
        else:
            return "pending"

class InferenceMonitoring(Base):
    __tablename__ = "inference_monitoring"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("diagnosis_assessments.id"))
    
    # Monitoring configuration
    model_name = Column(String(255), nullable=False)
    model_version = Column(String(100))
    endpoint_url = Column(String(500))  # Model inference endpoint
    
    # Monitoring settings
    monitoring_enabled = Column(Boolean, default=True)
    sample_rate = Column(Float, default=0.1)  # Rate of inference sampling
    batch_size = Column(Integer, default=100)  # Batch size for processing
    
    # Alert configuration
    alert_thresholds = Column(JSON)  # Alert thresholds for various metrics
    alert_contacts = Column(JSON)  # Contact information for alerts
    
    # Real-time metrics
    total_inferences = Column(Integer, default=0)
    last_inference_time = Column(DateTime(timezone=True))
    average_latency = Column(Float)  # Average inference latency
    error_rate = Column(Float)  # Error rate
    
    # Performance tracking
    performance_metrics = Column(JSON)  # Real-time performance metrics
    drift_scores = Column(JSON)  # Real-time drift scores
    
    # Monitoring status
    last_check_time = Column(DateTime(timezone=True))
    next_check_time = Column(DateTime(timezone=True))
    monitoring_status = Column(String(20), default="active")  # "active", "paused", "stopped"
    
    # Timing
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    assessment = relationship("DiagnosisAssessment", backref="inference_monitoring")
    
    @property
    def is_monitoring_active(self):
        """Check if monitoring is currently active"""
        return (self.monitoring_enabled and 
                self.monitoring_status == "active" and
                self.next_check_time and
                self.next_check_time > func.now())