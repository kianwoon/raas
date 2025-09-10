'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { jobApi } from '@/lib/api/jobs';
import { Job, JobStatus, JobType } from '@/types/common';
import { 
  RefreshCw, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function JobMonitoringDashboard() {
  const [filters, setFilters] = useState({
    status: undefined as JobStatus | undefined,
    type: undefined as JobType | undefined,
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10
  });

  const { data: jobsData, isLoading, refetch } = useQuery(
    ['jobs', filters, pagination],
    () => jobApi.getJobs({
      skip: (pagination.page - 1) * pagination.limit,
      limit: pagination.limit,
      status: filters.status,
      job_type: filters.type,
      sort_by: 'created_at',
      sort_desc: true
    }),
    {
      refetchInterval: 5000, // Refresh every 5 seconds
      keepPreviousData: true
    }
  );

  const { data: statsData } = useQuery(
    'jobStats',
    () => jobApi.getJobStats(),
    {
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  );

  const handleRefresh = () => {
    refetch();
    toast.success('Jobs refreshed');
  };

  const handleJobAction = async (jobId: string, action: 'cancel' | 'retry') => {
    try {
      if (action === 'cancel') {
        await jobApi.cancelJob(jobId);
        toast.success('Job cancelled successfully');
      } else if (action === 'retry') {
        await jobApi.retryJob(jobId);
        toast.success('Job retry initiated');
      }
      refetch();
    } catch (error) {
      toast.error(`Failed to ${action} job`);
    }
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case JobStatus.RUNNING:
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case JobStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      case JobStatus.FAILED:
        return <XCircle className="h-4 w-4" />;
      case JobStatus.CANCELLED:
        return <Square className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getJobTypeColor = (type: JobType) => {
    switch (type) {
      case JobType.FAIRNESS_ASSESSMENT:
        return 'bg-purple-100 text-purple-800';
      case JobType.DIAGNOSIS_ASSESSMENT:
        return 'bg-blue-100 text-blue-800';
      case JobType.MODEL_CARD_GENERATION:
        return 'bg-green-100 text-green-800';
      case JobType.EVIDENCE_PACK_GENERATION:
        return 'bg-orange-100 text-orange-800';
      case JobType.DATA_INGESTION:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage background jobs and tasks</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.total_jobs}</div>
              <p className="text-xs text-muted-foreground">
                Across all types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running Jobs</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.jobs_by_status.running || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently executing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(statsData.success_rate * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Jobs completed successfully
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.avg_execution_time.toFixed(1)}s</div>
              <p className="text-xs text-muted-foreground">
                Average job duration
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  status: e.target.value ? e.target.value as JobStatus : undefined 
                }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Statuses</option>
                {Object.values(JobStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  type: e.target.value ? e.target.value as JobType : undefined 
                }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Types</option>
                {Object.values(JobType).map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
          <CardDescription>
            {jobsData ? `Showing ${jobsData.jobs.length} of ${jobsData.total} jobs` : 'Loading jobs...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {jobsData?.jobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(job.status)}
                      </div>
                      <div>
                        <h3 className="font-medium">{job.name}</h3>
                        <p className="text-sm text-gray-600">{job.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getJobTypeColor(job.job_type)}>
                            {job.job_type.replace(/_/g, ' ')}
                          </Badge>
                          <StatusBadge status={job.status} />
                          <span className="text-xs text-gray-500">
                            {new Date(job.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{job.progress}%</div>
                        {job.status === JobStatus.RUNNING && (
                          <Progress value={job.progress} className="w-24" />
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {(job.status === JobStatus.RUNNING || job.status === JobStatus.PENDING) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleJobAction(job.id, 'cancel')}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {job.status === JobStatus.FAILED && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleJobAction(job.id, 'retry')}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {job.status === JobStatus.COMPLETED && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => jobApi.getJobArtifacts(job.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Navigate to job details
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {job.error_message && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      {job.error_message}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Pagination */}
              {jobsData && jobsData.total > jobsData.jobs.length && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    Page {jobsData.page} of {Math.ceil(jobsData.total / jobsData.size)}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={jobsData.page * jobsData.size >= jobsData.total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}