import apiClient from './client';
import {
  UUID,
  JobResponse
} from '../types/common';
import {
  FairnessAssessment,
  FairnessAssessmentCreate,
  FairnessAssessmentUpdate,
  FairnessAssessmentExecutionRequest,
  FairnessAssessmentResponse,
  FairnessAssessmentListResponse,
  FairnessAssessmentConfigurationWizard,
  FairnessAssessmentWizardResponse,
  FairnessReportRequest,
  FairnessReportResponse,
  FairnessMetricComparison,
  FairnessComparisonResponse,
  FairnessAssessmentStatus
} from '../types/assessment';
import {
  DiagnosisAssessment,
  DiagnosisAssessmentCreate,
  DiagnosisAssessmentUpdate,
  DiagnosisAssessmentExecutionRequest,
  DiagnosisAssessmentResponse,
  DiagnosisAssessmentListResponse,
  DiagnosisReportRequest,
  DiagnosisReportResponse,
  DiagnosisAssessmentStatus
} from '../types/assessment';

const API_URL = '/api/v1';

export const assessmentApi = {
  // Fairness Assessment APIs
  async createFairnessAssessment(assessment: FairnessAssessmentCreate): Promise<FairnessAssessmentResponse> {
    const response = await apiClient.post(`${API_URL}/fairness-assessments`, assessment);
    return response.data;
  },

  async getFairnessAssessments(params?: {
    skip?: number;
    limit?: number;
    status?: FairnessAssessmentStatus;
    sort_by?: string;
    sort_desc?: boolean;
  }): Promise<FairnessAssessmentListResponse> {
    const response = await apiClient.get(`${API_URL}/fairness-assessments`, { params });
    return response.data;
  },

  async getFairnessAssessment(assessmentId: UUID): Promise<FairnessAssessmentResponse> {
    const response = await apiClient.get(`${API_URL}/fairness-assessments/${assessmentId}`);
    return response.data;
  },

  async updateFairnessAssessment(assessmentId: UUID, update: FairnessAssessmentUpdate): Promise<FairnessAssessmentResponse> {
    const response = await apiClient.put(`${API_URL}/fairness-assessments/${assessmentId}`, update);
    return response.data;
  },

  async deleteFairnessAssessment(assessmentId: UUID): Promise<void> {
    await apiClient.delete(`${API_URL}/fairness-assessments/${assessmentId}`);
  },

  async executeFairnessAssessment(request: FairnessAssessmentExecutionRequest): Promise<JobResponse> {
    const response = await apiClient.post(`${API_URL}/fairness-assessments/${request.assessment_id}/execute`, request);
    return response.data;
  },

  async getFairnessAssessmentConfiguration(assessmentId: UUID): Promise<{
    configuration: any;
    validation_status: Record<string, boolean>;
    errors?: string[];
  }> {
    const response = await apiClient.get(`${API_URL}/fairness-assessments/${assessmentId}/configuration`);
    return response.data;
  },

  async updateFairnessAssessmentConfiguration(assessmentId: UUID, configuration: any): Promise<FairnessAssessmentResponse> {
    const response = await apiClient.put(`${API_URL}/fairness-assessments/${assessmentId}/configuration`, { configuration });
    return response.data;
  },

  async getFairnessAssessmentResults(assessmentId: UUID): Promise<{
    overall_fairness_score: number;
    metric_results: any[];
    bias_detected: boolean;
    recommendations: string[];
    visualization_data: Record<string, any>;
    report_url?: string;
  }> {
    const response = await apiClient.get(`${API_URL}/fairness-assessments/${assessmentId}/results`);
    return response.data;
  },

  async getFairnessAssessmentWizard(assessmentId?: UUID): Promise<FairnessAssessmentWizardResponse> {
    const url = assessmentId 
      ? `${API_URL}/fairness-assessments/${assessmentId}/wizard`
      : `${API_URL}/fairness-assessments/wizard`;
    const response = await apiClient.get(url);
    return response.data;
  },

  async updateFairnessAssessmentWizard(assessmentId: UUID, wizardData: FairnessAssessmentConfigurationWizard): Promise<FairnessAssessmentWizardResponse> {
    const response = await apiClient.put(`${API_URL}/fairness-assessments/${assessmentId}/wizard`, wizardData);
    return response.data;
  },

  async completeFairnessAssessmentWizard(assessmentId: UUID): Promise<FairnessAssessmentResponse> {
    const response = await apiClient.post(`${API_URL}/fairness-assessments/${assessmentId}/wizard/complete`);
    return response.data;
  },

  async generateFairnessReport(request: FairnessReportRequest): Promise<FairnessReportResponse> {
    const response = await apiClient.post(`${API_URL}/fairness-assessments/${request.assessment_id}/report`, request);
    return response.data;
  },

  async downloadFairnessReport(assessmentId: UUID, format: 'pdf' | 'html' | 'json'): Promise<Blob> {
    const response = await apiClient.get(`${API_URL}/fairness-assessments/${assessmentId}/report/download`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  async compareFairnessAssessments(baselineId: UUID, currentId: UUID): Promise<FairnessComparisonResponse> {
    const response = await apiClient.get(`${API_URL}/fairness-assessments/compare`, {
      params: { baseline_id: baselineId, current_id: currentId }
    });
    return response.data;
  },

  async getFairnessAssessmentTrends(modelId?: UUID, timeRange?: string): Promise<{
    trend_data: Array<{
      date: string;
      fairness_score: number;
      bias_detected: boolean;
    }>;
    summary: string;
  }> {
    const params: any = {};
    if (modelId) params.model_id = modelId;
    if (timeRange) params.time_range = timeRange;
    
    const response = await apiClient.get(`${API_URL}/fairness-assessments/trends`, { params });
    return response.data;
  },

  async getFairnessMetricDefinitions(): Promise<{
    metrics: Array<{
      name: string;
      description: string;
      formula: string;
      range: [number, number];
      interpretation: string;
    }>;
  }> {
    const response = await apiClient.get(`${API_URL}/fairness-assessments/metrics/definitions`);
    return response.data;
  },

  // Diagnosis Assessment APIs
  async runDiagnostics(diagnosticConfig: {
    name: string;
    description?: string;
    model_name: string;
    model_version?: string;
    model_id?: UUID;
    diagnosis_types: string[];
    performance_metrics?: string[];
    drift_detection_config?: any;
    explainability_config?: any;
    data_source_id?: UUID;
    baseline_data_source_id?: UUID;
    data_query?: string;
    notebook_template?: string;
    execution_parameters?: any;
    priority?: number;
  }): Promise<DiagnosisAssessmentResponse> {
    const response = await apiClient.post(`${API_URL}/diagnostics/run`, diagnosticConfig);
    return response.data;
  },

  async getDiagnosticsRuns(params?: {
    skip?: number;
    limit?: number;
    status?: DiagnosisAssessmentStatus;
    sort_by?: string;
    sort_desc?: boolean;
  }): Promise<DiagnosisAssessmentListResponse> {
    const response = await apiClient.get(`${API_URL}/diagnostics/runs`, { params });
    return response.data;
  },

  async getDiagnosisAssessment(assessmentId: UUID): Promise<DiagnosisAssessmentResponse> {
    const response = await apiClient.get(`${API_URL}/diagnostics/runs/${assessmentId}`);
    return response.data;
  },

  async updateDiagnosisAssessment(assessmentId: UUID, update: DiagnosisAssessmentUpdate): Promise<DiagnosisAssessmentResponse> {
    const response = await apiClient.put(`${API_URL}/diagnostics/runs/${assessmentId}`, update);
    return response.data;
  },

  async deleteDiagnosisAssessment(assessmentId: UUID): Promise<void> {
    await apiClient.delete(`${API_URL}/diagnostics/runs/${assessmentId}`);
  },

  async getDiagnosisAssessmentResults(assessmentId: UUID): Promise<{
    performance_metrics?: any[];
    drift_detection?: any;
    explainability?: any;
    overall_health_score: number;
    recommendations: string[];
    visualization_data: Record<string, any>;
    report_url?: string;
  }> {
    const response = await apiClient.get(`${API_URL}/diagnostics/runs/${assessmentId}/results`);
    return response.data;
  },

  async generateDiagnosisReport(request: DiagnosisReportRequest): Promise<DiagnosisReportResponse> {
    const response = await apiClient.post(`${API_URL}/diagnostics/runs/${request.assessment_id}/report`, request);
    return response.data;
  },

  async downloadDiagnosisReport(assessmentId: UUID, format: 'pdf' | 'html' | 'json'): Promise<Blob> {
    const response = await apiClient.get(`${API_URL}/diagnostics/runs/${assessmentId}/report/download`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  async getDriftAnalysis(modelId: UUID, timeRange?: string): Promise<{
    drift_score: number;
    drift_detected: boolean;
    drift_metrics: any[];
    significant_features: string[];
    recommendations: string[];
  }> {
    const params: any = {};
    if (timeRange) params.time_range = timeRange;
    
    const response = await apiClient.get(`${API_URL}/diagnostics/models/${modelId}/drift-analysis`, { params });
    return response.data;
  },

  async getFeatureImportance(modelId: UUID, dataSourceId?: UUID): Promise<{
    feature_importance: any[];
    overall_interpretability_score: number;
    insights: string[];
  }> {
    const params: any = {};
    if (dataSourceId) params.data_source_id = dataSourceId;
    
    const response = await apiClient.get(`${API_URL}/diagnostics/models/${modelId}/feature-importance`, { params });
    return response.data;
  },

  async getPerformanceMetrics(modelId: UUID, timeRange?: string): Promise<{
    metrics: any[];
    trends: Record<string, any>;
    summary: string;
  }> {
    const params: any = {};
    if (timeRange) params.time_range = timeRange;
    
    const response = await apiClient.get(`${API_URL}/diagnostics/models/${modelId}/performance-metrics`, { params });
    return response.data;
  },

  async getDiagnosisTemplates(): Promise<{
    templates: Array<{
      id: string;
      name: string;
      description: string;
      diagnosis_types: string[];
      configuration: any;
    }>;
  }> {
    const response = await apiClient.get(`${API_URL}/diagnostics/templates`);
    return response.data;
  },

  async executeDiagnosticNotebook(assessmentId: UUID): Promise<{
    job_id: UUID;
    notebook_url?: string;
    execution_status: string;
  }> {
    const response = await apiClient.post(`${API_URL}/diagnostics/runs/${assessmentId}/execute-notebook`);
    return response.data;
  },

  async getDiagnosticNotebookResults(assessmentId: UUID): Promise<{
    notebook_results: any;
    visualizations: any[];
    artifacts: any[];
  }> {
    const response = await apiClient.get(`${API_URL}/diagnostics/runs/${assessmentId}/notebook-results`);
    return response.data;
  }
};