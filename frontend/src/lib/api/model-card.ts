import apiClient from './client';

const API_URL = '/api/v1/model-cards';

export interface ModelCardResponse {
  models: any[];
  total: number;
  page: number;
  size: number;
}

export interface ModelCardDetailResponse {
  model_card: any;
  fairness_metrics: any[];
  compliance_info: any[];
}

export const modelCardApi = {
  // Get model cards with pagination and filtering
  async getModelCards(params?: {
    skip?: number;
    limit?: number;
    domain?: string;
    risk_tier?: string;
    status?: string;
    search?: string;
  }): Promise<ModelCardResponse> {
    const response = await apiClient.get(API_URL, { params });
    return response.data;
  },

  // Get a single model card by ID
  async getModelCard(id: string): Promise<ModelCardDetailResponse> {
    const response = await apiClient.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Create a new model card
  async createModelCard(data: any): Promise<any> {
    const response = await apiClient.post(API_URL, data);
    return response.data;
  },

  // Update an existing model card
  async updateModelCard(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  // Delete a model card
  async deleteModelCard(id: string): Promise<void> {
    await apiClient.delete(`${API_URL}/${id}`);
  },

  // Get fairness metrics for a model card
  async getFairnessMetrics(id: string): Promise<any[]> {
    const response = await apiClient.get(`${API_URL}/${id}/fairness-metrics`);
    return response.data;
  },

  // Add fairness metrics to a model card
  async addFairnessMetrics(id: string, data: any): Promise<any> {
    const response = await apiClient.post(`${API_URL}/${id}/fairness-metrics`, data);
    return response.data;
  },

  // Get compliance information for a model card
  async getComplianceInfo(id: string): Promise<any[]> {
    const response = await apiClient.get(`${API_URL}/${id}/compliance-info`);
    return response.data;
  },

  // Add compliance information to a model card
  async addComplianceInfo(id: string, data: any): Promise<any> {
    const response = await apiClient.post(`${API_URL}/${id}/compliance-info`, data);
    return response.data;
  },

  // Get model card statistics
  async getModelCardStatistics(): Promise<any> {
    const response = await apiClient.get(`${API_URL}/statistics`);
    return response.data;
  },

  // Get model card fairness score distribution
  async getFairnessScoreDistribution(): Promise<Record<string, number>> {
    const response = await apiClient.get(`${API_URL}/fairness-distribution`);
    return response.data;
  }
};