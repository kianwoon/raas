import apiClient from './client';

// Define types inline to resolve import issues
export type UUID = string;

export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  TIMEOUT = 'timeout'
}

export enum JobType {
  FAIRNESS_ASSESSMENT = 'fairness_assessment',
  DIAGNOSIS_ASSESSMENT = 'diagnosis_assessment',
  MODEL_CARD_GENERATION = 'model_card_generation',
  EVIDENCE_PACK_GENERATION = 'evidence_pack_generation',
  DATA_INGESTION = 'data_ingestion',
  VALIDATION = 'validation'
}

export interface Job {
  id: UUID;
  name: string;
  description?: string;
  job_type: JobType;
  status: JobStatus;
  progress: number;
  created_by: UUID;
  organization_id: UUID;
  parameters: Record<string, any>;
  result?: Record<string, any>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface JobCreate {
  name: string;
  description?: string;
  job_type: JobType;
  parameters: Record<string, any>;
  priority?: number;
}

export interface JobUpdate {
  name?: string;
  description?: string;
  status?: JobStatus;
  progress?: number;
  parameters?: Record<string, any>;
  result?: Record<string, any>;
  error_message?: string;
}

export interface JobSubmissionRequest {
  name: string;
  description?: string;
  job_type: JobType;
  parameters: Record<string, any>;
  priority?: number;
  scheduled_at?: string;
}

export interface JobCancelRequest {
  reason?: string;
}

export interface JobRetryRequest {
  retry_parameters?: Record<string, any>;
}

export interface JobResponse {
  job: Job;
}

export interface JobListResponse {
  jobs: Job[];
  total: number;
  page: number;
  size: number;
}

export interface JobArtifactResponse {
  artifacts: {
    id: UUID;
    artifact_type: string;
    file_path: string;
    file_size: number;
    created_at: string;
  }[];
  download_urls: Record<string, string>;
}

const API_URL = '/api/v1';

export const jobApi = {
  // Submit a new job
  async submitJob(jobRequest: JobSubmissionRequest): Promise<JobResponse> {
    const response = await apiClient.post(`${API_URL}/jobs`, jobRequest);
    return response.data;
  },

  // Get jobs with filtering and pagination
  async getJobs(params?: {
    skip?: number;
    limit?: number;
    job_type?: JobType;
    status?: JobStatus;
    sort_by?: string;
    sort_desc?: boolean;
  }): Promise<JobListResponse> {
    const response = await apiClient.get(`${API_URL}/jobs`, { params });
    return response.data;
  },

  // Get a specific job by ID
  async getJob(jobId: UUID): Promise<JobResponse> {
    const response = await apiClient.get(`${API_URL}/jobs/${jobId}`);
    return response.data;
  },

  // Update a job
  async updateJob(jobId: UUID, jobUpdate: JobUpdate): Promise<JobResponse> {
    const response = await apiClient.put(`${API_URL}/jobs/${jobId}`, jobUpdate);
    return response.data;
  },

  // Delete a job
  async deleteJob(jobId: UUID): Promise<void> {
    await apiClient.delete(`${API_URL}/jobs/${jobId}`);
  },

  // Cancel a job
  async cancelJob(jobId: UUID, cancelRequest?: JobCancelRequest): Promise<JobResponse> {
    const response = await apiClient.post(`${API_URL}/jobs/${jobId}/cancel`, cancelRequest || {});
    return response.data;
  },

  // Retry a failed job
  async retryJob(jobId: UUID, retryRequest?: JobRetryRequest): Promise<JobResponse> {
    const response = await apiClient.post(`${API_URL}/jobs/${jobId}/retry`, retryRequest || {});
    return response.data;
  },

  // Get job artifacts
  async getJobArtifacts(jobId: UUID): Promise<JobArtifactResponse> {
    const response = await apiClient.get(`${API_URL}/jobs/${jobId}/artifacts`);
    return response.data;
  },

  // Get job statistics
  async getJobStats(): Promise<{
    total_jobs: number;
    jobs_by_status: Record<JobStatus, number>;
    jobs_by_type: Record<JobType, number>;
    avg_execution_time: number;
    success_rate: number;
  }> {
    const response = await apiClient.get(`${API_URL}/jobs/stats`);
    return response.data;
  },

  // Clean up old jobs
  async cleanupOldJobs(daysToKeep: number = 30): Promise<{
    message: string;
    deleted_count: number;
  }> {
    const response = await apiClient.post(`${API_URL}/jobs/cleanup`, null, {
      params: { days_to_keep: daysToKeep }
    });
    return response.data;
  },

  // Monitor job progress with WebSocket-like polling
  async monitorJobProgress(jobId: UUID, onProgress: (job: Job) => void, interval: number = 2000): Promise<void> {
    const checkProgress = async () => {
      try {
        const response = await this.getJob(jobId);
        onProgress(response.job);
        
        if (response.job.status === JobStatus.COMPLETED || 
            response.job.status === JobStatus.FAILED || 
            response.job.status === JobStatus.CANCELLED) {
          return;
        }
        
        setTimeout(checkProgress, interval);
      } catch (error) {
        console.error('Error monitoring job progress:', error);
      }
    };
    
    checkProgress();
  },

  // Get job logs (if available)
  async getJobLogs(jobId: UUID): Promise<{
    logs: string[];
    metadata: Record<string, any>;
  }> {
    const response = await apiClient.get(`${API_URL}/jobs/${jobId}/logs`);
    return response.data;
  },

  // Download job artifact
  async downloadJobArtifact(jobId: UUID, artifactId: UUID): Promise<Blob> {
    const response = await apiClient.get(`${API_URL}/jobs/${jobId}/artifacts/${artifactId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
};