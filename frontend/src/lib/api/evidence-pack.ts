import apiClient from './client';
import {
  UUID,
  EvidencePack,
  EvidencePackCreate,
  EvidencePackResponse
} from '../types/common';

const API_URL = '/api/v1';

export const evidencePackApi = {
  // Evidence Pack Management
  async createEvidencePack(evidencePack: EvidencePackCreate): Promise<EvidencePackResponse> {
    const response = await apiClient.post(`${API_URL}/evidence-packs`, evidencePack);
    return response.data;
  },

  async getEvidencePacks(params?: {
    model_card_id?: UUID;
    pack_type?: 'fairness' | 'compliance' | 'performance' | 'complete';
    status?: 'generating' | 'completed' | 'failed';
    skip?: number;
    limit?: number;
  }): Promise<{
    evidence_packs: EvidencePack[];
    total: number;
    page: number;
    size: number;
  }> {
    const response = await apiClient.get(`${API_URL}/evidence-packs`, { params });
    return response.data;
  },

  async getEvidencePack(evidencePackId: UUID): Promise<EvidencePackResponse> {
    const response = await apiClient.get(`${API_URL}/evidence-packs/${evidencePackId}`);
    return response.data;
  },

  async updateEvidencePack(evidencePackId: UUID, update: {
    name?: string;
    description?: string;
    custom_sections?: string[];
  }): Promise<EvidencePackResponse> {
    const response = await apiClient.put(`${API_URL}/evidence-packs/${evidencePackId}`, update);
    return response.data;
  },

  async deleteEvidencePack(evidencePackId: UUID): Promise<void> {
    await apiClient.delete(`${API_URL}/evidence-packs/${evidencePackId}`);
  },

  async downloadEvidencePack(evidencePackId: UUID): Promise<Blob> {
    const response = await apiClient.get(`${API_URL}/evidence-packs/${evidencePackId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async generateEvidencePack(evidencePackId: UUID): Promise<{
    job_id: UUID;
    message: string;
  }> {
    const response = await apiClient.post(`${API_URL}/evidence-packs/${evidencePackId}/generate`);
    return response.data;
  },

  async getEvidencePackStatus(evidencePackId: UUID): Promise<{
    status: 'generating' | 'completed' | 'failed';
    progress: number;
    job_id?: UUID;
    error_message?: string;
    estimated_completion?: string;
  }> {
    const response = await apiClient.get(`${API_URL}/evidence-packs/${evidencePackId}/status`);
    return response.data;
  },

  // Evidence Pack Templates
  async getEvidencePackTemplates(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    pack_type: 'fairness' | 'compliance' | 'performance' | 'complete';
    sections: Array<{
      name: string;
      description: string;
      required: boolean;
      data_sources: string[];
    }>;
    metadata: Record<string, any>;
  }>> {
    const response = await apiClient.get(`${API_URL}/evidence-packs/templates`);
    return response.data;
  },

  async createEvidencePackFromTemplate(templateId: string, modelCardId: UUID, options?: {
    name?: string;
    description?: string;
    custom_sections?: string[];
  }): Promise<EvidencePackResponse> {
    const response = await apiClient.post(`${API_URL}/evidence-packs/templates/${templateId}/create`, {
      model_card_id: modelCardId,
      ...options
    });
    return response.data;
  },

  // Evidence Pack Preview
  async previewEvidencePack(evidencePackId: UUID): Promise<{
    sections: Array<{
      name: string;
      content: any;
      data_sources: string[];
    }>;
    total_size: number;
    estimated_generation_time: number;
    warnings: string[];
  }> {
    const response = await apiClient.get(`${API_URL}/evidence-packs/${evidencePackId}/preview`);
    return response.data;
  },

  // Evidence Pack Validation
  async validateEvidencePack(evidencePackId: UUID): Promise<{
    is_valid: boolean;
    validation_results: Array<{
      section: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    overall_score: number;
    recommendations: string[];
  }> {
    const response = await apiClient.get(`${API_URL}/evidence-packs/${evidencePackId}/validate`);
    return response.data;
  },

  // Evidence Pack Analytics
  async getEvidencePackAnalytics(modelCardId?: UUID, timeRange?: string): Promise<{
    total_packs: number;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    avg_generation_time: number;
    download_count: number;
    trends: Array<{
      date: string;
      created: number;
      downloaded: number;
    }>;
  }> {
    const params: any = {};
    if (modelCardId) params.model_card_id = modelCardId;
    if (timeRange) params.time_range = timeRange;
    
    const response = await apiClient.get(`${API_URL}/evidence-packs/analytics`, { params });
    return response.data;
  },

  // Evidence Pack Scheduling
  async scheduleEvidencePackGeneration(schedule: {
    model_card_id: UUID;
    pack_type: 'fairness' | 'compliance' | 'performance' | 'complete';
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    schedule_config: {
      time?: string;
      day_of_week?: number;
      day_of_month?: number;
    };
    notification_config?: {
      email?: string;
      webhook_url?: string;
    };
  }): Promise<{
    schedule_id: UUID;
    message: string;
  }> {
    const response = await apiClient.post(`${API_URL}/evidence-packs/schedule`, schedule);
    return response.data;
  },

  async getScheduledEvidencePackGenerations(): Promise<Array<{
    id: UUID;
    model_card_id: UUID;
    pack_type: string;
    frequency: string;
    next_run: string;
    is_active: boolean;
    created_at: string;
  }>> {
    const response = await apiClient.get(`${API_URL}/evidence-packs/schedules`);
    return response.data;
  },

  async updateScheduledGeneration(scheduleId: UUID, update: {
    frequency?: string;
    schedule_config?: Record<string, any>;
    notification_config?: Record<string, any>;
    is_active?: boolean;
  }): Promise<{
    id: UUID;
    message: string;
  }> {
    const response = await apiClient.put(`${API_URL}/evidence-packs/schedules/${scheduleId}`, update);
    return response.data;
  },

  async deleteScheduledGeneration(scheduleId: UUID): Promise<void> {
    await apiClient.delete(`${API_URL}/evidence-packs/schedules/${scheduleId}`);
  },

  // Evidence Pack Sharing
  async shareEvidencePack(evidencePackId: UUID, sharingConfig: {
    share_type: 'public' | 'private' | 'organization';
    shared_with?: UUID[];
    expires_at?: string;
    password?: string;
  }): Promise<{
    share_id: UUID;
    share_url?: string;
    message: string;
  }> {
    const response = await apiClient.post(`${API_URL}/evidence-packs/${evidencePackId}/share`, sharingConfig);
    return response.data;
  },

  async getSharedEvidencePack(shareId: UUID, password?: string): Promise<EvidencePackResponse> {
    const params: any = {};
    if (password) params.password = password;
    
    const response = await apiClient.get(`${API_URL}/evidence-packs/shared/${shareId}`, { params });
    return response.data;
  },

  async downloadSharedEvidencePack(shareId: UUID, password?: string): Promise<Blob> {
    const params: any = {};
    if (password) params.password = password;
    
    const response = await apiClient.get(`${API_URL}/evidence-packs/shared/${shareId}/download`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Evidence Pack History
  async getEvidencePackHistory(evidencePackId: UUID): Promise<Array<{
    id: UUID;
    action: string;
    user_id: UUID;
    user_name: string;
    timestamp: string;
    details: Record<string, any>;
  }>> {
    const response = await apiClient.get(`${API_URL}/evidence-packs/${evidencePackId}/history`);
    return response.data;
  },

  // Evidence Pack Bulk Operations
  async bulkGenerateEvidencePacks(modelCardIds: UUID[], packType: 'fairness' | 'compliance' | 'performance' | 'complete'): Promise<{
    job_id: UUID;
    message: string;
    total_packs: number;
  }> {
    const response = await apiClient.post(`${API_URL}/evidence-packs/bulk-generate`, {
      model_card_ids: modelCardIds,
      pack_type: packType
    });
    return response.data;
  },

  async bulkDownloadEvidencePacks(evidencePackIds: UUID[]): Promise<Blob> {
    const response = await apiClient.post(`${API_URL}/evidence-packs/bulk-download`, {
      evidence_pack_ids: evidencePackIds
    }, {
      responseType: 'blob'
    });
    return response.data;
  }
};