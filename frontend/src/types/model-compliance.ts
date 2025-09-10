import { UUID } from './common';

export interface ModelCompliance {
  id: UUID;
  model_card_id: UUID;
  framework_id: UUID;
  status: 'compliant' | 'non_compliant' | 'partial';
  last_assessed_date?: string;
  next_assessment_date?: string;
  assessor_id?: UUID;
  notes?: string;
  evidence_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ModelComplianceCreate {
  framework_id: UUID;
  status: 'compliant' | 'non_compliant' | 'partial';
  last_assessed_date?: string;
  next_assessment_date?: string;
  assessor_id?: UUID;
  notes?: string;
  evidence_url?: string;
}

export interface ModelComplianceUpdate {
  framework_id?: UUID;
  status?: 'compliant' | 'non_compliant' | 'partial';
  last_assessed_date?: string;
  next_assessment_date?: string;
  assessor_id?: UUID;
  notes?: string;
  evidence_url?: string;
}