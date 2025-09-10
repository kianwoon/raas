import { UUID } from './common';

export interface FairnessMetric {
  id: UUID;
  model_card_id: UUID;
  metric_name: string;
  value: number;
  threshold: number;
  status: 'pass' | 'fail' | 'warning';
  description?: string;
  demographic_groups?: string[];
  calculation_method?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface FairnessMetricCreate {
  metric_name: string;
  value: number;
  threshold: number;
  status: 'pass' | 'fail' | 'warning';
  description?: string;
  demographic_groups?: string[];
  calculation_method?: string;
  metadata?: Record<string, any>;
}

export interface FairnessMetricUpdate {
  metric_name?: string;
  value?: number;
  threshold?: number;
  status?: 'pass' | 'fail' | 'warning';
  description?: string;
  demographic_groups?: string[];
  calculation_method?: string;
  metadata?: Record<string, any>;
}