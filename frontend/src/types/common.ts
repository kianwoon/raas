export type UUID = string;

// Job Management Types
export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

export enum JobType {
  FAIRNESS_ASSESSMENT = 'fairness_assessment',
  DIAGNOSIS_ASSESSMENT = 'diagnosis_assessment',
  MODEL_CARD_GENERATION = 'model_card_generation',
  EVIDENCE_PACK_GENERATION = 'evidence_pack_generation',
  DATA_INGESTION = 'data_ingestion',
  VALIDATION = 'validation'
}

export interface Job {
  id: UUID;
  name: string;
  description?: string;
  job_type: JobType;
  status: JobStatus;
  progress: number;
  created_by: UUID;
  organization_id: UUID;
  parameters: Record<string, any>;
  result?: Record<string, any>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface JobCreate {
  name: string;
  description?: string;
  job_type: JobType;
  parameters: Record<string, any>;
  priority?: number;
}

export interface JobUpdate {
  name?: string;
  description?: string;
  status?: JobStatus;
  progress?: number;
  parameters?: Record<string, any>;
  result?: Record<string, any>;
  error_message?: string;
}

export interface JobSubmissionRequest {
  name: string;
  description?: string;
  job_type: JobType;
  parameters: Record<string, any>;
  priority?: number;
  scheduled_at?: string;
}

export interface JobCancelRequest {
  reason?: string;
}

export interface JobRetryRequest {
  retry_parameters?: Record<string, any>;
}

export interface JobResponse {
  job: Job;
}

export interface JobListResponse {
  jobs: Job[];
  total: number;
  page: number;
  size: number;
}

export interface JobArtifactResponse {
  artifacts: {
    id: UUID;
    artifact_type: string;
    file_path: string;
    file_size: number;
    created_at: string;
  }[];
  download_urls: Record<string, string>;
}

// Approval Workflow Types
export enum ApprovalStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CHANGES_REQUESTED = 'changes_requested'
}

export interface ApprovalWorkflow {
  id: UUID;
  model_card_id: UUID;
  status: ApprovalStatus;
  current_stage: string;
  requested_by: UUID;
  reviewers: UUID[];
  approval_date?: string;
  rejection_reason?: string;
  comments?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ApprovalWorkflowCreate {
  model_card_id: UUID;
  reviewers: UUID[];
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  comments?: string;
}

export interface ApprovalDecision {
  decision: 'approve' | 'reject' | 'request_changes';
  comments?: string;
  additional_reviewers?: UUID[];
}

// Evidence Pack Types
export interface EvidencePack {
  id: UUID;
  model_card_id: UUID;
  name: string;
  description?: string;
  pack_type: 'fairness' | 'compliance' | 'performance' | 'complete';
  status: 'generating' | 'completed' | 'failed';
  file_path?: string;
  file_size?: number;
  download_url?: string;
  job_id?: UUID;
  generated_by: UUID;
  created_at: string;
  updated_at: string;
}

export interface EvidencePackCreate {
  model_card_id: UUID;
  name: string;
  description?: string;
  pack_type: 'fairness' | 'compliance' | 'performance' | 'complete';
  include_fairness_metrics: boolean;
  include_compliance_info: boolean;
  include_performance_metrics: boolean;
  include_artifacts: boolean;
  custom_sections?: string[];
}

export interface EvidencePackResponse {
  evidence_pack: EvidencePack;
  download_url?: string;
}

// Data Source Types
export enum DataSourceType {
  FILE_UPLOAD = 'file_upload',
  DATABASE = 'database',
  API = 'api',
  CLOUD_STORAGE = 'cloud_storage',
  DATA_LAKE = 'data_lake'
}

export interface DataSource {
  id: UUID;
  name: string;
  description?: string;
  source_type: DataSourceType;
  connection_config?: Record<string, any>;
  schema_info?: Record<string, any>;
  sample_data_size?: number;
  is_active: boolean;
  created_by: UUID;
  organization_id: UUID;
  created_at: string;
  updated_at: string;
}

export interface DataSourceCreate {
  name: string;
  description?: string;
  source_type: DataSourceType;
  connection_config?: Record<string, any>;
  file_content?: string;
  file_name?: string;
  protected_attributes?: string[];
  sample_data_size?: number;
}

export interface DataSourceUpdate {
  name?: string;
  description?: string;
  connection_config?: Record<string, any>;
  is_active?: boolean;
}

export interface FileUploadResponse {
  data_source_id: UUID;
  file_name: string;
  file_size: number;
  file_path: string;
  upload_status: 'success' | 'failed';
  message?: string;
  sample_data?: Record<string, any>[];
}

export interface ConnectorTestResponse {
  success: boolean;
  message: string;
  connection_details?: Record<string, any>;
}

// Schema Mapping Types
export interface SchemaMapping {
  id: UUID;
  data_source_id: UUID;
  source_schema: Record<string, any>;
  target_schema: Record<string, any>;
  mappings: Record<string, string>;
  transformations?: Record<string, any>;
  is_active: boolean;
  created_by: UUID;
  created_at: string;
  updated_at: string;
}

export interface SchemaMappingCreate {
  data_source_id: UUID;
  source_schema: Record<string, any>;
  target_schema: Record<string, any>;
  mappings: Record<string, string>;
  transformations?: Record<string, any>;
}

export interface SchemaMappingUpdate {
  mappings?: Record<string, string>;
  transformations?: Record<string, any>;
  is_active?: boolean;
}

export interface SchemaMappingResponse {
  id: UUID;
  data_source_id: UUID;
  source_schema: Record<string, any>;
  target_schema: Record<string, any>;
  mappings: Record<string, string>;
  transformations?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Validation Types
export interface ValidationRule {
  id: UUID;
  name: string;
  rule_type: 'data_quality' | 'fairness' | 'compliance';
  conditions: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
}

export interface DataValidation {
  id: UUID;
  data_source_id: UUID;
  validation_rules: ValidationRule[];
  validation_results: Record<string, any>;
  overall_score: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_by: UUID;
  created_at: string;
  updated_at: string;
}

export interface DataValidationCreate {
  data_source_id: UUID;
  validation_rules: ValidationRule[];
}

export interface DataValidationResponse {
  id: UUID;
  data_source_id: UUID;
  validation_results: Record<string, any>;
  overall_score: number;
  status: string;
  created_at: string;
}

export interface ValidationSummary {
  total_rules: number;
  passed_rules: number;
  failed_rules: number;
  overall_score: number;
  critical_issues: number;
  recommendations: string[];
}