import { UUID } from './common';

// Fairness Assessment Types
export enum FairnessAssessmentStatus {
  DRAFT = 'draft',
  CONFIGURING = 'configuring',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface FairnessAssessment {
  id: UUID;
  name: string;
  description?: string;
  model_name: string;
  model_version?: string;
  model_id?: UUID;
  data_source_id: UUID;
  status: FairnessAssessmentStatus;
  progress: number;
  configuration: FairnessAssessmentConfiguration;
  results?: FairnessAssessmentResults;
  job_id?: UUID;
  created_by: UUID;
  organization_id: UUID;
  created_at: string;
  updated_at: string;
}

export interface FairnessAssessmentConfiguration {
  protected_attributes: string[];
  fairness_metrics: string[];
  sensitive_groups?: Record<string, string[]>;
  thresholds?: Record<string, number>;
  custom_metrics?: Record<string, any>;
  visualization_config?: FairnessVisualizationConfig;
}

export interface FairnessVisualizationConfig {
  charts: string[];
  color_schemes: Record<string, string>;
  chart_types: Record<string, string>;
  interactive_features: boolean;
}

export interface FairnessAssessmentResults {
  overall_fairness_score: number;
  metric_results: FairnessMetricResult[];
  bias_detected: boolean;
  recommendations: string[];
  visualization_data: Record<string, any>;
  report_url?: string;
  artifacts?: Record<string, any>;
}

export interface FairnessMetricResult {
  metric_name: string;
  metric_value: number;
  threshold: number;
  status: 'pass' | 'fail' | 'warning';
  demographic_group?: string;
  confidence_interval?: [number, number];
  p_value?: number;
  interpretation?: string;
}

export interface FairnessAssessmentCreate {
  name: string;
  description?: string;
  model_name: string;
  model_version?: string;
  model_id?: UUID;
  data_source_id: UUID;
  configuration: FairnessAssessmentConfiguration;
}

export interface FairnessAssessmentUpdate {
  name?: string;
  description?: string;
  configuration?: FairnessAssessmentConfiguration;
}

export interface FairnessAssessmentExecutionRequest {
  assessment_id: UUID;
  execution_parameters?: Record<string, any>;
  priority?: number;
}

export interface FairnessAssessmentResponse {
  id: UUID;
  name: string;
  description?: string;
  model_name: string;
  model_version?: string;
  model_id?: UUID;
  data_source_id: UUID;
  status: FairnessAssessmentStatus;
  progress: number;
  configuration: FairnessAssessmentConfiguration;
  results?: FairnessAssessmentResults;
  job_id?: UUID;
  created_at: string;
  updated_at: string;
}

export interface FairnessAssessmentListResponse {
  assessments: FairnessAssessmentResponse[];
  total: number;
  page: number;
  size: number;
}

export interface FairnessAssessmentConfigurationWizard {
  step: number;
  total_steps: number;
  current_step_data: Record<string, any>;
  completed_steps: string[];
  validation_status: Record<string, boolean>;
}

export interface FairnessAssessmentWizardResponse {
  wizard: FairnessAssessmentConfigurationWizard;
  assessment_id?: UUID;
  next_step?: string;
  can_proceed: boolean;
  errors?: string[];
}

export interface FairnessReportRequest {
  assessment_id: UUID;
  report_format: 'pdf' | 'html' | 'json';
  include_visualizations: boolean;
  include_recommendations: boolean;
  custom_sections?: string[];
}

export interface FairnessReportResponse {
  report_id: UUID;
  download_url: string;
  format: string;
  file_size: number;
  generated_at: string;
  expires_at: string;
}

export interface FairnessMetricComparison {
  metric_name: string;
  baseline_value: number;
  current_value: number;
  change_percentage: number;
  significance: 'significant' | 'not_significant';
  confidence_level: number;
}

export interface FairnessComparisonResponse {
  comparisons: FairnessMetricComparison[];
  overall_trend: 'improving' | 'declining' | 'stable';
  summary: string;
  recommendations: string[];
}

// Diagnosis Assessment Types
export enum DiagnosisAssessmentStatus {
  DRAFT = 'draft',
  CONFIGURING = 'configuring',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface DiagnosisAssessment {
  id: UUID;
  name: string;
  description?: string;
  model_name: string;
  model_version?: string;
  model_id?: UUID;
  diagnosis_types: string[];
  status: DiagnosisAssessmentStatus;
  progress: number;
  configuration: DiagnosisAssessmentConfiguration;
  results?: DiagnosisAssessmentResults;
  job_id?: UUID;
  created_by: UUID;
  organization_id: UUID;
  created_at: string;
  updated_at: string;
}

export interface DiagnosisAssessmentConfiguration {
  performance_metrics?: string[];
  drift_detection_config?: DriftDetectionConfig;
  explainability_config?: ExplainabilityConfig;
  data_source_id?: UUID;
  baseline_data_source_id?: UUID;
  data_query?: string;
  notebook_template?: string;
  custom_parameters?: Record<string, any>;
}

export interface DriftDetectionConfig {
  metrics: string[];
  threshold: number;
  method: 'statistical' | 'ml_based' | 'hybrid';
  baseline_period?: string;
  comparison_period?: string;
}

export interface ExplainabilityConfig {
  methods: string[];
  target_column?: string;
  feature_importance: boolean;
  partial_dependence: boolean;
  shap_values: boolean;
  lime_explanations: boolean;
  sample_size?: number;
}

export interface DiagnosisAssessmentResults {
  performance_metrics?: PerformanceMetricResult[];
  drift_detection?: DriftDetectionResult;
  explainability?: ExplainabilityResult;
  overall_health_score: number;
  recommendations: string[];
  visualization_data: Record<string, any>;
  report_url?: string;
  artifacts?: Record<string, any>;
}

export interface PerformanceMetricResult {
  metric_name: string;
  metric_value: number;
  threshold?: number;
  status: 'good' | 'warning' | 'poor';
  trend: 'improving' | 'stable' | 'declining';
  confidence_interval?: [number, number];
}

export interface DriftDetectionResult {
  overall_drift_score: number;
  drift_detected: boolean;
  drift_metrics: DriftMetricResult[];
  significant_features: string[];
  drift_period: {
    start: string;
    end: string;
  };
  recommendations: string[];
}

export interface DriftMetricResult {
  feature_name: string;
  drift_score: number;
  drift_type: 'covariate' | 'concept' | 'label';
  significance: number;
  status: 'drifted' | 'stable' | 'warning';
}

export interface ExplainabilityResult {
  feature_importance: FeatureImportance[];
  partial_dependence_plots?: Record<string, any>;
  shap_summary?: Record<string, any>;
  lime_explanations?: Record<string, any>;
  overall_interpretability_score: number;
  insights: string[];
}

export interface FeatureImportance {
  feature_name: string;
  importance_score: number;
  direction: 'positive' | 'negative';
  confidence: number;
}

export interface DiagnosisAssessmentCreate {
  name: string;
  description?: string;
  model_name: string;
  model_version?: string;
  model_id?: UUID;
  diagnosis_types: string[];
  configuration: DiagnosisAssessmentConfiguration;
}

export interface DiagnosisAssessmentUpdate {
  name?: string;
  description?: string;
  configuration?: DiagnosisAssessmentConfiguration;
}

export interface DiagnosisAssessmentExecutionRequest {
  assessment_id: UUID;
  execution_parameters?: Record<string, any>;
  priority?: number;
}

export interface DiagnosisAssessmentResponse {
  id: UUID;
  name: string;
  description?: string;
  model_name: string;
  model_version?: string;
  model_id?: UUID;
  diagnosis_types: string[];
  status: DiagnosisAssessmentStatus;
  progress: number;
  configuration: DiagnosisAssessmentConfiguration;
  results?: DiagnosisAssessmentResults;
  job_id?: UUID;
  created_at: string;
  updated_at: string;
}

export interface DiagnosisAssessmentListResponse {
  assessments: DiagnosisAssessmentResponse[];
  total: number;
  page: number;
  size: number;
}

export interface DiagnosisReportRequest {
  assessment_id: UUID;
  report_format: 'pdf' | 'html' | 'json';
  include_visualizations: boolean;
  include_recommendations: boolean;
  custom_sections?: string[];
}

export interface DiagnosisReportResponse {
  report_id: UUID;
  download_url: string;
  format: string;
  file_size: number;
  generated_at: string;
  expires_at: string;
}