import { UUID } from './common';

export interface ModelVersion {
  id: UUID;
  model_card_id: UUID;
  version: string;
  changelog?: string;
  created_by?: string;
  is_current: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ModelVersionCreate {
  version: string;
  changelog?: string;
  created_by?: string;
  is_current?: boolean;
}

export interface ModelVersionUpdate {
  version?: string;
  changelog?: string;
  created_by?: string;
  is_current?: boolean;
}