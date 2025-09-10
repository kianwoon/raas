import modelCardApi from '@/lib/api/model-card';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Model Card API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getModelCards', () => {
    it('should fetch model cards with default parameters', async () => {
      const mockResponse = {
        data: {
          models: [
            {
              id: '1',
              name: 'Test Model',
              version: '1.0.0',
              description: 'Test description',
              domain: 'healthcare',
              risk_tier: 'medium',
              status: 'approved',
              organization_id: 'org1',
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z',
            },
          ],
          total: 1,
          skip: 0,
          limit: 12,
        },
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await modelCardApi.getModelCards();

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.create().get).toHaveBeenCalledWith('/api/v1/model-cards?skip=0&limit=12');
    });

    it('should fetch model cards with custom filters', async () => {
      const mockResponse = {
        data: {
          models: [],
          total: 0,
          skip: 0,
          limit: 12,
        },
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const filters = {
        skip: 10,
        limit: 5,
        domain: 'finance',
        risk_tier: 'high',
        status: 'pending_review',
        search: 'test',
      };

      const result = await modelCardApi.getModelCards(filters);

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.create().get).toHaveBeenCalledWith(
        '/api/v1/model-cards?skip=10&limit=5&domain=finance&risk_tier=high&status=pending_review&search=test'
      );
    });
  });

  describe('getModelCard', () => {
    it('should fetch a single model card by ID', async () => {
      const mockResponse = {
        data: {
          model_card: {
            id: '1',
            name: 'Test Model',
            version: '1.0.0',
            description: 'Test description',
            domain: 'healthcare',
            risk_tier: 'medium',
            status: 'approved',
            organization_id: 'org1',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          fairness_metrics: [],
          compliance_info: [],
        },
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await modelCardApi.getModelCard('1');

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.create().get).toHaveBeenCalledWith('/api/v1/model-cards/1');
    });
  });

  describe('createModelCard', () => {
    it('should create a new model card', async () => {
      const modelCardData = {
        name: 'New Model',
        version: '1.0.0',
        description: 'New model description',
        domain: 'finance',
        risk_tier: 'low' as const,
        status: 'draft' as const,
      };

      const mockResponse = {
        data: {
          id: '2',
          ...modelCardData,
          organization_id: 'org1',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await modelCardApi.createModelCard(modelCardData);

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.create().post).toHaveBeenCalledWith('/api/v1/model-cards', modelCardData);
    });
  });

  describe('updateModelCard', () => {
    it('should update an existing model card', async () => {
      const updateData = {
        name: 'Updated Model',
        status: 'approved' as const,
      };

      const mockResponse = {
        data: {
          id: '1',
          name: 'Updated Model',
          version: '1.0.0',
          description: 'Test description',
          domain: 'healthcare',
          risk_tier: 'medium',
          status: 'approved',
          organization_id: 'org1',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z',
        },
      };

      mockedAxios.create.mockReturnValue({
        put: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await modelCardApi.updateModelCard('1', updateData);

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.create().put).toHaveBeenCalledWith('/api/v1/model-cards/1', updateData);
    });
  });

  describe('deleteModelCard', () => {
    it('should delete a model card', async () => {
      mockedAxios.create.mockReturnValue({
        delete: jest.fn().mockResolvedValue({}),
      } as any);

      await modelCardApi.deleteModelCard('1');

      expect(mockedAxios.create().delete).toHaveBeenCalledWith('/api/v1/model-cards/1');
    });
  });

  describe('getFairnessMetrics', () => {
    it('should fetch fairness metrics for a model card', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            model_card_id: '1',
            metric_name: 'Demographic Parity',
            metric_value: 0.85,
            threshold_value: 0.8,
            created_at: '2023-01-01T00:00:00Z',
          },
        ],
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await modelCardApi.getFairnessMetrics('1');

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.create().get).toHaveBeenCalledWith('/api/v1/model-cards/1/fairness-metrics');
    });
  });

  describe('addFairnessMetrics', () => {
    it('should add fairness metrics to a model card', async () => {
      const metricsData = {
        metric_name: 'Equal Opportunity',
        metric_value: 0.9,
        threshold_value: 0.8,
        demographic_group: 'gender',
      };

      const mockResponse = {
        data: {
          id: '2',
          model_card_id: '1',
          ...metricsData,
          created_at: '2023-01-01T00:00:00Z',
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await modelCardApi.addFairnessMetrics('1', metricsData);

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.create().post).toHaveBeenCalledWith('/api/v1/model-cards/1/fairness-metrics', metricsData);
    });
  });

  describe('getComplianceInfo', () => {
    it('should fetch compliance information for a model card', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            model_card_id: '1',
            framework_name: 'AI Ethics Framework',
            framework_version: '1.0',
            compliance_status: 'compliant' as const,
            assessment_date: '2023-01-01T00:00:00Z',
            created_at: '2023-01-01T00:00:00Z',
          },
        ],
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await modelCardApi.getComplianceInfo('1');

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.create().get).toHaveBeenCalledWith('/api/v1/model-cards/1/compliance-info');
    });
  });

  describe('addComplianceInfo', () => {
    it('should add compliance information to a model card', async () => {
      const complianceData = {
        framework_name: 'Responsible AI Framework',
        framework_version: '2.0',
        compliance_status: 'partially_compliant' as const,
        assessment_date: '2023-01-01T00:00:00Z',
      };

      const mockResponse = {
        data: {
          id: '2',
          model_card_id: '1',
          ...complianceData,
          created_at: '2023-01-01T00:00:00Z',
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await modelCardApi.addComplianceInfo('1', complianceData);

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.create().post).toHaveBeenCalledWith('/api/v1/model-cards/1/compliance-info', complianceData);
    });
  });

  describe('getModelCardStatistics', () => {
    it('should fetch model card statistics', async () => {
      const mockResponse = {
        data: {
          total_models: 100,
          by_domain: {
            healthcare: 30,
            finance: 25,
            retail: 20,
            other: 25,
          },
          by_risk_tier: {
            low: 40,
            medium: 35,
            high: 20,
            critical: 5,
          },
          by_status: {
            draft: 20,
            pending_review: 15,
            approved: 60,
            deprecated: 5,
          },
        },
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await modelCardApi.getModelCardStatistics();

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.create().get).toHaveBeenCalledWith('/api/v1/model-cards/statistics');
    });
  });

  describe('getFairnessScoreDistribution', () => {
    it('should fetch fairness score distribution', async () => {
      const mockResponse = {
        data: {
          '0.0-0.2': 5,
          '0.2-0.4': 10,
          '0.4-0.6': 15,
          '0.6-0.8': 30,
          '0.8-1.0': 40,
        },
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await modelCardApi.getFairnessScoreDistribution();

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.create().get).toHaveBeenCalledWith('/api/v1/model-cards/fairness-distribution');
    });
  });
});