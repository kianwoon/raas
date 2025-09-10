import { UUID } from './common';

export interface ImpactAssessment {
  id: UUID;
  model_card_id: UUID;
  assessment_type: string;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  affected_groups?: string[];
  mitigation_measures?: string[];
  assessment_date?: string;
  assessor_id?: UUID;
  notes?: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'approved';
  created_at?: string;
  updated_at?: string;
}

export interface ImpactAssessmentCreate {
  assessment_type: string;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  affected_groups?: string[];
  mitigation_measures?: string[];
  assessment_date?: string;
  assessor_id?: UUID;
  notes?: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'approved';
}

export interface ImpactAssessmentUpdate {
  assessment_type?: string;
  impact_level?: 'low' | 'medium' | 'high' | 'critical';
  affected_groups?: string[];
  mitigation_measures?: string[];
  assessment_date?: string;
  assessor_id?: UUID;
  notes?: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'approved';
}