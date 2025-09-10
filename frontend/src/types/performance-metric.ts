import { UUID } from './common';

export interface PerformanceMetric {
  id: UUID;
  model_card_id: UUID;
  metric_name: string;
  value: number;
  unit?: string;
  test_dataset?: string;
  measurement_date?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface PerformanceMetricCreate {
  metric_name: string;
  value: number;
  unit?: string;
  test_dataset?: string;
  measurement_date?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetricUpdate {
  metric_name?: string;
  value?: number;
  unit?: string;
  test_dataset?: string;
  measurement_date?: string;
  metadata?: Record<string, any>;
}