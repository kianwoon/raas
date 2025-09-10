export interface ModelCard {
  id: string;
  name: string;
  version: string;
  description: string;
  domain: string;
  risk_tier: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'pending_review' | 'approved' | 'deprecated';
  fairness_score?: number;
  organization_id: string;
  documentation_url?: string;
  contact_email?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FairnessMetric {
  id: string;
  model_card_id: string;
  metric_name: string;
  metric_value: number;
  threshold_value: number;
  demographic_group?: string;
  description?: string;
  created_at: string;
}

export interface ComplianceInfo {
  id: string;
  model_card_id: string;
  framework_name: string;
  framework_version: string;
  compliance_status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed';
  assessment_date: string;
  evidence_url?: string;
  notes?: string;
  created_at: string;
}

export interface ModelCardFilters {
  skip?: number;
  limit?: number;
  domain?: string;
  risk_tier?: string;
  status?: string;
  search?: string;
}

export interface ModelCardResponse {
  models: ModelCard[];
  total: number;
  skip: number;
  limit: number;
}

export interface ModelCardDetailResponse {
  model_card: ModelCard;
  fairness_metrics: FairnessMetric[];
  compliance_info: ComplianceInfo[];
}