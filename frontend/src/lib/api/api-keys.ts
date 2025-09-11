// Dynamic import to avoid circular dependencies
let apiClient: any;

const getApiClient = async () => {
  if (!apiClient) {
    const module = await import('./client');
    apiClient = module.default || module.apiClient; // Try both default and named export
    console.log('API Client loaded:', apiClient ? 'Success' : 'Failed');
    console.log('Module exports:', Object.keys(module));
  }
  return apiClient;
};

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  environment: 'development' | 'production';
  permissions: string[];
  rate_limit: number;
  ip_whitelist: string[];
  description?: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
  usage_count: number;
  monthly_usage: number;
  usage_percentage: number;
}

export interface ApiKeyStats {
  total_keys: number;
  active_keys: number;
  total_usage: number;
  monthly_usage: number;
}

export interface ApiKeyActivity {
  id: string;
  api_key_id: string;
  action: 'created' | 'used' | 'revoked' | 'regenerated';
  status: string;
  ip_address: string;
  user_agent?: string;
  endpoint?: string;
  response_status?: number;
  response_time_ms?: number;
  additional_metadata?: Record<string, any>;
  timestamp: string;
}

export interface ApiKeyCreate {
  name: string;
  environment: 'development' | 'production';
  permissions: string[];
  rate_limit: number;
  ip_whitelist: string[];
  description?: string;
  expires_at?: string;
}

export interface ApiKeyFilters {
  environment?: 'development' | 'production';
  is_active?: boolean;
  search?: string;
}

export class ApiKeyService {
  private static instance: ApiKeyService;

  public static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService();
    }
    return ApiKeyService.instance;
  }

  async getApiKeys(filters?: ApiKeyFilters): Promise<ApiKey[]> {
    try {
      const client = await getApiClient();
      
      const params = new URLSearchParams();
      if (filters?.environment) params.append('environment', filters.environment);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `/api/v1/api-keys/${queryString ? `?${queryString}` : ''}`;

      const response = await client.get<ApiKey[]>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
  }

  async getApiKeyStats(): Promise<ApiKeyStats> {
    try {
      const client = await getApiClient();
      const response = await client.get<ApiKeyStats>('/api/v1/api-keys/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching API key stats:', error);
      throw error;
    }
  }

  async createApiKey(data: ApiKeyCreate): Promise<ApiKey> {
    try {
      const client = await getApiClient();
      const response = await client.post<ApiKey>('/api/v1/api-keys/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  }

  async getApiKey(keyId: string): Promise<ApiKey> {
    try {
      const client = await getApiClient();
      const response = await client.get<ApiKey>(`/api/v1/api-keys/${keyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching API key:', error);
      throw error;
    }
  }

  async revokeApiKey(keyId: string): Promise<void> {
    try {
      const client = await getApiClient();
      await client.delete(`/api/v1/api-keys/${keyId}`);
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw error;
    }
  }

  async regenerateApiKey(keyId: string): Promise<ApiKey> {
    try {
      const client = await getApiClient();
      const response = await client.post<ApiKey>(`/api/v1/api-keys/${keyId}/regenerate`);
      return response.data;
    } catch (error) {
      console.error('Error regenerating API key:', error);
      throw error;
    }
  }

  async getKeyActivities(keyId: string): Promise<ApiKeyActivity[]> {
    try {
      const client = await getApiClient();
      const response = await client.get<ApiKeyActivity[]>(`/api/v1/api-keys/${keyId}/activities`);
      return response.data;
    } catch (error) {
      console.error('Error fetching key activities:', error);
      throw error;
    }
  }
}

export const apiKeyService = ApiKeyService.getInstance();