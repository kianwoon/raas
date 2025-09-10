import apiClient from './client';
import {
  UUID,
  ApprovalWorkflow,
  ApprovalWorkflowCreate,
  ApprovalDecision,
  ApprovalStatus
} from '../types/common';
import {
  ModelCard,
  ModelCardFilters,
  ModelCardResponse,
  ModelCardDetailResponse
} from '../types/model-card';

const API_URL = '/api/v1';

export const modelCardEnhancementApi = {
  // Enhanced Model Card Management
  async generateModelCardFromAssessment(assessmentId: UUID, options?: {
    template?: string;
    include_fairness_metrics?: boolean;
    include_compliance_info?: boolean;
    custom_sections?: string[];
  }): Promise<ModelCard> {
    const response = await apiClient.post(`${API_URL}/model-cards/generate-from-assessment`, {
      assessment_id: assessmentId,
      ...options
    });
    return response.data;
  },

  async generateModelCardFromModel(modelId: UUID, options?: {
    template?: string;
    auto_extract_metrics?: boolean;
    include_data_sources?: boolean;
    custom_sections?: string[];
  }): Promise<ModelCard> {
    const response = await apiClient.post(`${API_URL}/model-cards/generate-from-model`, {
      model_id: modelId,
      ...options
    });
    return response.data;
  },

  async enhanceModelCard(modelCardId: UUID, enhancementConfig: {
    add_fairness_metrics?: boolean;
    add_compliance_info?: boolean;
    add_performance_metrics?: boolean;
    add_data_lineage?: boolean;
    add_usage_statistics?: boolean;
    custom_enhancements?: Record<string, any>;
  }): Promise<ModelCard> {
    const response = await apiClient.post(`${API_URL}/model-cards/${modelCardId}/enhance`, enhancementConfig);
    return response.data;
  },

  async getModelCardEnhancementSuggestions(modelCardId: UUID): Promise<{
    suggestions: Array<{
      type: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      estimated_impact: string;
    }>;
    overall_score: number;
  }> {
    const response = await apiClient.get(`${API_URL}/model-cards/${modelCardId}/enhancement-suggestions`);
    return response.data;
  },

  async validateModelCard(modelCardId: UUID): Promise<{
    is_valid: boolean;
    validation_results: Array<{
      field: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      severity: 'low' | 'medium' | 'high';
    }>;
    overall_score: number;
    recommendations: string[];
  }> {
    const response = await apiClient.get(`${API_URL}/model-cards/${modelCardId}/validate`);
    return response.data;
  },

  // Approval Workflow Management
  async createApprovalWorkflow(workflow: ApprovalWorkflowCreate): Promise<ApprovalWorkflow> {
    const response = await apiClient.post(`${API_URL}/model-cards/${workflow.model_card_id}/approval-workflow`, workflow);
    return response.data;
  },

  async getApprovalWorkflow(modelCardId: UUID): Promise<ApprovalWorkflow> {
    const response = await apiClient.get(`${API_URL}/model-cards/${modelCardId}/approval-workflow`);
    return response.data;
  },

  async updateApprovalWorkflow(modelCardId: UUID, update: {
    reviewers?: UUID[];
    due_date?: string;
    priority?: string;
    comments?: string;
  }): Promise<ApprovalWorkflow> {
    const response = await apiClient.put(`${API_URL}/model-cards/${modelCardId}/approval-workflow`, update);
    return response.data;
  },

  async submitForApproval(modelCardId: UUID, options?: {
    message?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    due_date?: string;
  }): Promise<ApprovalWorkflow> {
    const response = await apiClient.post(`${API_URL}/model-cards/${modelCardId}/submit-for-approval`, options);
    return response.data;
  },

  async makeApprovalDecision(modelCardId: UUID, decision: ApprovalDecision): Promise<ApprovalWorkflow> {
    const response = await apiClient.post(`${API_URL}/model-cards/${modelCardId}/approval-decision`, decision);
    return response.data;
  },

  async getApprovalHistory(modelCardId: UUID): Promise<Array<{
    id: UUID;
    action: string;
    decision: 'approve' | 'reject' | 'request_changes';
    reviewer_id: UUID;
    reviewer_name: string;
    comments?: string;
    timestamp: string;
  }>> {
    const response = await apiClient.get(`${API_URL}/model-cards/${modelCardId}/approval-history`);
    return response.data;
  },

  async getPendingApprovals(params?: {
    skip?: number;
    limit?: number;
    priority?: string;
  }): Promise<{
    workflows: ApprovalWorkflow[];
    total: number;
    page: number;
    size: number;
  }> {
    const response = await apiClient.get(`${API_URL}/model-cards/pending-approvals`, { params });
    return response.data;
  },

  // Model Card Templates
  async getModelCardTemplates(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    sections: string[];
    required_fields: string[];
    metadata: Record<string, any>;
  }>> {
    const response = await apiClient.get(`${API_URL}/model-cards/templates`);
    return response.data;
  },

  async createModelCardFromTemplate(templateId: string, data: {
    name: string;
    version: string;
    description: string;
    domain: string;
    [key: string]: any;
  }): Promise<ModelCard> {
    const response = await apiClient.post(`${API_URL}/model-cards/templates/${templateId}/create`, data);
    return response.data;
  },

  async validateModelCardAgainstTemplate(modelCardId: UUID, templateId: string): Promise<{
    is_compliant: boolean;
    missing_fields: string[];
    validation_errors: Array<{
      field: string;
      error: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  }> {
    const response = await apiClient.get(`${API_URL}/model-cards/${modelCardId}/validate-template/${templateId}`);
    return response.data;
  },

  // Model Card Versioning
  async createModelCardVersion(modelCardId: UUID, versionData: {
    version: string;
    changelog?: string;
    is_major?: boolean;
  }): Promise<ModelCard> {
    const response = await apiClient.post(`${API_URL}/model-cards/${modelCardId}/versions`, versionData);
    return response.data;
  },

  async getModelCardVersions(modelCardId: UUID): Promise<Array<{
    id: UUID;
    version: string;
    changelog?: string;
    created_at: string;
    created_by: UUID;
    is_current: boolean;
  }>> {
    const response = await apiClient.get(`${API_URL}/model-cards/${modelCardId}/versions`);
    return response.data;
  },

  async compareModelCardVersions(modelCardId: UUID, version1: string, version2: string): Promise<{
    differences: Array<{
      field: string;
      old_value: any;
      new_value: any;
      change_type: 'added' | 'modified' | 'removed';
    }>;
    summary: string;
  }> {
    const response = await apiClient.get(`${API_URL}/model-cards/${modelCardId}/versions/compare`, {
      params: { version1, version2 }
    });
    return response.data;
  },

  // Model Card Analytics
  async getModelCardAnalytics(modelCardId?: UUID, timeRange?: string): Promise<{
    total_model_cards: number;
    by_status: Record<string, number>;
    by_risk_tier: Record<string, number>;
    by_domain: Record<string, number>;
    avg_fairness_score: number;
    approval_rates: Record<string, number>;
    trends: Array<{
      date: string;
      created: number;
      approved: number;
      updated: number;
    }>;
  }> {
    const params: any = {};
    if (modelCardId) params.model_card_id = modelCardId;
    if (timeRange) params.time_range = timeRange;
    
    const response = await apiClient.get(`${API_URL}/model-cards/analytics`, { params });
    return response.data;
  },

  async getModelCardStatistics(): Promise<{
    total_count: number;
    approved_count: number;
    pending_review_count: number;
    avg_fairness_score: number;
    risk_distribution: Record<string, number>;
    domain_distribution: Record<string, number>;
    recent_activity: Array<{
      action: string;
      model_card_name: string;
      timestamp: string;
      user: string;
    }>;
  }> {
    const response = await apiClient.get(`${API_URL}/model-cards/statistics`);
    return response.data;
  },

  // Model Card Search and Filtering
  async searchModelCards(query: string, filters?: ModelCardFilters): Promise<ModelCardResponse> {
    const response = await apiClient.get(`${API_URL}/model-cards/search`, {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  async getSimilarModelCards(modelCardId: UUID, limit: number = 5): Promise<{
    similar_models: Array<{
      model_card: ModelCard;
      similarity_score: number;
      common_attributes: string[];
    }>;
  }> {
    const response = await apiClient.get(`${API_URL}/model-cards/${modelCardId}/similar`, {
      params: { limit }
    });
    return response.data;
  },

  // Model Card Export
  async exportModelCard(modelCardId: UUID, format: 'json' | 'pdf' | 'html' | 'markdown'): Promise<Blob> {
    const response = await apiClient.get(`${API_URL}/model-cards/${modelCardId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  async bulkExportModelCards(modelCardIds: UUID[], format: 'json' | 'csv' | 'excel'): Promise<Blob> {
    const response = await apiClient.post(`${API_URL}/model-cards/bulk-export`, {
      model_card_ids: modelCardIds,
      format
    }, {
      responseType: 'blob'
    });
    return response.data;
  }
};