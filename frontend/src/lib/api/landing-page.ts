import apiClient from './client';

const API_URL = '/api/v1/landing-page';

export const landingPageApi = {
  async getFeaturedModelCards(params?: {
    limit?: number;
    use_sample_data?: boolean;
  }) {
    const response = await apiClient.get(`${API_URL}/model-cards`, { params });
    return response.data;
  },

  async getFairnessScoreDistribution(params?: {
    use_sample_data?: boolean;
  }) {
    const response = await apiClient.get(`${API_URL}/fairness-distribution`, { params });
    return response.data;
  },

  async getModelCardStatistics(params?: {
    use_sample_data?: boolean;
  }) {
    const response = await apiClient.get(`${API_URL}/statistics`, { params });
    return response.data;
  },

  async getComplianceFrameworks(params?: {
    limit?: number;
    use_sample_data?: boolean;
  }) {
    const response = await apiClient.get(`${API_URL}/compliance-frameworks`, { params });
    return response.data;
  },

  async getRecentReports(params?: {
    limit?: number;
    use_sample_data?: boolean;
  }) {
    const response = await apiClient.get(`${API_URL}/reports`, { params });
    return response.data;
  },

  async getEducationalContent(params?: {
    use_sample_data?: boolean;
  }) {
    const response = await apiClient.get(`${API_URL}/educational-content`, { params });
    return response.data;
  }
};