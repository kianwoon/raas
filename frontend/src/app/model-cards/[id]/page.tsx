'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ModelCard, FairnessMetric, ComplianceInfo } from '@/types/model-card';
import { modelCardApi } from '@/lib/api/model-card';

export default function ModelCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const modelCardId = params.id as string;
  
  const [modelCard, setModelCard] = useState<ModelCard | null>(null);
  const [fairnessMetrics, setFairnessMetrics] = useState<FairnessMetric[]>([]);
  const [complianceInfo, setComplianceInfo] = useState<ComplianceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModelCardDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await modelCardApi.getModelCard(modelCardId);
        setModelCard(response.model_card);
        setFairnessMetrics(response.fairness_metrics);
        setComplianceInfo(response.compliance_info);
      } catch (err) {
        console.error('Error fetching model card details:', err);
        setError('Failed to load model card details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchModelCardDetail();
  }, [modelCardId]);

  const getRiskTierColor = (tier: string) => {
    switch (tier) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'deprecated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'partially_compliant':
        return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      case 'not_assessed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFairnessScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.7) return 'text-yellow-500';
    if (score >= 0.6) return 'text-orange-500';
    return 'text-red-500';
  };

  const handleEdit = () => {
    router.push(`/model-cards/${modelCardId}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !modelCard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Model Card</h3>
          <p className="text-gray-500 mb-4">{error || 'Model card not found'}</p>
          <button 
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <button 
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Model Cards
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{modelCard.name}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-gray-600">Version {modelCard.version}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskTierColor(modelCard.risk_tier)}`}>
                {modelCard.risk_tier.charAt(0).toUpperCase() + modelCard.risk_tier.slice(1)} Risk
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(modelCard.status)}`}>
                {modelCard.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {modelCard.domain}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700">{modelCard.description}</p>
            </div>
            
            {/* Fairness Metrics */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Fairness Metrics</h2>
                {modelCard.fairness_score !== undefined && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Overall Fairness Score</p>
                    <div className={`text-2xl font-bold ${getFairnessScoreColor(modelCard.fairness_score)}`}>
                      {(modelCard.fairness_score * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
              
              {fairnessMetrics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metric
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Threshold
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Demographic Group
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fairnessMetrics.map((metric) => (
                        <tr key={metric.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {metric.metric_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metric.metric_value.toFixed(4)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metric.threshold_value.toFixed(4)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metric.demographic_group || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No fairness metrics available for this model.</p>
                </div>
              )}
            </div>
            
            {/* Compliance Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Compliance Information</h2>
              
              {complianceInfo.length > 0 ? (
                <div className="space-y-4">
                  {complianceInfo.map((compliance) => (
                    <div key={compliance.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">{compliance.framework_name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getComplianceStatusColor(compliance.compliance_status)}`}>
                          {compliance.compliance_status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Framework Version</p>
                          <p className="font-medium">{compliance.framework_version}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Assessment Date</p>
                          <p className="font-medium">{new Date(compliance.assessment_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {compliance.notes && (
                        <div className="mt-3">
                          <p className="text-gray-500 text-sm">Notes</p>
                          <p className="text-gray-700">{compliance.notes}</p>
                        </div>
                      )}
                      {compliance.evidence_url && (
                        <div className="mt-3">
                          <a 
                            href={compliance.evidence_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Evidence →
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No compliance information available for this model.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Metadata</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{new Date(modelCard.created_at).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{new Date(modelCard.updated_at).toLocaleDateString()}</p>
                </div>
                
                {modelCard.contact_email && (
                  <div>
                    <p className="text-sm text-gray-500">Contact Email</p>
                    <p className="font-medium">{modelCard.contact_email}</p>
                  </div>
                )}
                
                {modelCard.documentation_url && (
                  <div>
                    <p className="text-sm text-gray-500">Documentation</p>
                    <a 
                      href={modelCard.documentation_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Documentation →
                    </a>
                  </div>
                )}
                
                {modelCard.tags && modelCard.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {modelCard.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleEdit}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Model Card
                </button>
                
                {modelCard.documentation_url && (
                  <a
                    href={modelCard.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Documentation
                  </a>
                )}
                
                <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}