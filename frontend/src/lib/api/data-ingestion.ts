import apiClient from './client';
import {
  UUID,
  DataSource,
  DataSourceCreate,
  DataSourceUpdate,
  FileUploadResponse,
  ConnectorTestResponse,
  SchemaMapping,
  SchemaMappingCreate,
  SchemaMappingUpdate,
  SchemaMappingResponse,
  ValidationRule,
  DataValidation,
  DataValidationCreate,
  DataValidationResponse,
  ValidationSummary,
  DataSourceType
} from '../types/common';

const API_URL = '/api/v1';

export const dataIngestionApi = {
  // Data Source Management
  async createDataSource(dataSource: DataSourceCreate): Promise<DataSource> {
    const response = await apiClient.post(`${API_URL}/data-sources`, dataSource);
    return response.data;
  },

  async getDataSources(params?: {
    skip?: number;
    limit?: number;
    source_type?: DataSourceType;
  }): Promise<DataSource[]> {
    const response = await apiClient.get(`${API_URL}/data-sources`, { params });
    return response.data;
  },

  async getDataSource(dataSourceId: UUID): Promise<DataSource> {
    const response = await apiClient.get(`${API_URL}/data-sources/${dataSourceId}`);
    return response.data;
  },

  async updateDataSource(dataSourceId: UUID, update: DataSourceUpdate): Promise<DataSource> {
    const response = await apiClient.put(`${API_URL}/data-sources/${dataSourceId}`, update);
    return response.data;
  },

  async deleteDataSource(dataSourceId: UUID): Promise<void> {
    await apiClient.delete(`${API_URL}/data-sources/${dataSourceId}`);
  },

  // File Upload
  async uploadFile(file: File, options?: {
    description?: string;
    protectedAttributes?: string[];
    sampleSize?: number;
  }): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.description) {
      formData.append('description', options.description);
    }
    if (options?.protectedAttributes) {
      formData.append('protected_attributes', options.protectedAttributes.join(','));
    }
    if (options?.sampleSize) {
      formData.append('sample_size', options.sampleSize.toString());
    }

    const response = await apiClient.post(`${API_URL}/upload-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadModelFile(file: File, options?: {
    modelId?: UUID;
    description?: string;
  }): Promise<{
    model_id?: UUID;
    file_name: string;
    file_size: number;
    file_path: string;
    upload_status: string;
    message?: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.modelId) {
      formData.append('model_id', options.modelId.toString());
    }
    if (options?.description) {
      formData.append('description', options.description);
    }

    const response = await apiClient.post(`${API_URL}/upload-model`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Connector Management
  async testConnector(connectorType: DataSourceType, config: Record<string, any>): Promise<ConnectorTestResponse> {
    const response = await apiClient.post(`${API_URL}/test-connector`, {
      connector_type: connectorType,
      config
    });
    return response.data;
  },

  async getConnectorTypes(): Promise<{ types: DataSourceType[] }> {
    const response = await apiClient.get(`${API_URL}/connector-types`);
    return response.data;
  },

  async getConnectorConfigSchema(connectorType: DataSourceType): Promise<{ schema: Record<string, any> }> {
    const response = await apiClient.get(`${API_URL}/connector-config/${connectorType}`);
    return response.data;
  },

  // Schema Mapping
  async createSchemaMapping(mapping: SchemaMappingCreate): Promise<SchemaMappingResponse> {
    const response = await apiClient.post(`${API_URL}/schema-mappings`, mapping);
    return response.data;
  },

  async getSchemaMappings(dataSourceId?: UUID): Promise<SchemaMappingResponse[]> {
    const params = dataSourceId ? { data_source_id: dataSourceId } : {};
    const response = await apiClient.get(`${API_URL}/schema-mappings`, { params });
    return response.data;
  },

  async updateSchemaMapping(mappingId: UUID, update: SchemaMappingUpdate): Promise<SchemaMappingResponse> {
    const response = await apiClient.put(`${API_URL}/schema-mappings/${mappingId}`, update);
    return response.data;
  },

  async getDataPreview(request: {
    data_source_id: UUID;
    mapping_id?: UUID;
    limit?: number;
  }): Promise<{ data: Record<string, any>[] }> {
    const response = await apiClient.post(`${API_URL}/data-preview`, request);
    return response.data;
  },

  async suggestMappings(dataSourceId: UUID, targetSchema: Record<string, any>): Promise<{
    suggested_mappings: Record<string, string>;
    confidence_scores: Record<string, number>;
    warnings: string[];
  }> {
    const response = await apiClient.post(`${API_URL}/suggest-mappings`, {
      data_source_id: dataSourceId,
      target_schema: targetSchema
    });
    return response.data;
  },

  // Data Validation
  async createValidation(validation: DataValidationCreate): Promise<DataValidationResponse> {
    const response = await apiClient.post(`${API_URL}/validations`, validation);
    return response.data;
  },

  async getValidations(dataSourceId?: UUID): Promise<DataValidationResponse[]> {
    const params = dataSourceId ? { data_source_id: dataSourceId } : {};
    const response = await apiClient.get(`${API_URL}/validations`, { params });
    return response.data;
  },

  async getValidationSummary(dataSourceId: UUID): Promise<ValidationSummary> {
    const response = await apiClient.get(`${API_URL}/validations/summary/${dataSourceId}`);
    return response.data;
  },

  async getValidationTemplates(): Promise<{ templates: ValidationRule[] }> {
    const response = await apiClient.get(`${API_URL}/validation-templates`);
    return response.data;
  },

  async suggestValidationRules(dataSourceId: UUID): Promise<{ suggestions: ValidationRule[] }> {
    const response = await apiClient.post(`${API_URL}/suggest-validation-rules`, {
      data_source_id: dataSourceId
    });
    return response.data;
  },

  // Schema Inference
  async inferSchema(request: {
    data_source_id: UUID;
    sample_size?: number;
  }): Promise<{
    columns: Array<{
      name: string;
      data_type: string;
      nullable: boolean;
    }>;
    data_types: Record<string, string>;
    sample_stats: Record<string, any>;
    inferred_schema: Record<string, any>;
    confidence_scores: Record<string, number>;
  }> {
    const response = await apiClient.post(`${API_URL}/infer-schema`, request);
    return response.data;
  },

  // Protected Attributes
  async createProtectedAttributeConfig(config: {
    name: string;
    description?: string;
    attribute_name: string;
    attribute_type: string;
    sensitive_values?: string[];
    masking_rules?: Record<string, any>;
    bias_threshold?: number;
    fairness_metrics?: string[];
    is_sensitive?: boolean;
  }): Promise<{
    id: UUID;
    name: string;
    attribute_name: string;
    attribute_type: string;
    is_sensitive: boolean;
    created_at: string;
  }> {
    const response = await apiClient.post(`${API_URL}/protected-attributes`, config);
    return response.data;
  },

  async getProtectedAttributeConfigs(): Promise<{
    id: UUID;
    name: string;
    attribute_name: string;
    attribute_type: string;
    is_sensitive: boolean;
    created_at: string;
  }[]> {
    const response = await apiClient.get(`${API_URL}/protected-attributes`);
    return response.data;
  },

  // Utility Functions
  async getSupportedFileTypes(): Promise<{ file_types: string[] }> {
    const response = await apiClient.get(`${API_URL}/supported-file-types`);
    return response.data;
  },

  async getFileSizeLimit(): Promise<{ limit_bytes: number; limit_mb: number }> {
    const response = await apiClient.get(`${API_URL}/file-size-limit`);
    return response.data;
  },

  async getSupportedModelFileTypes(): Promise<{ model_types: string[] }> {
    const response = await apiClient.get(`${API_URL}/supported-model-types`);
    return response.data;
  },

  async getModelFileSizeLimit(): Promise<{ limit_bytes: number; limit_mb: number }> {
    const response = await apiClient.get(`${API_URL}/model-file-size-limit`);
    return response.data;
  }
};