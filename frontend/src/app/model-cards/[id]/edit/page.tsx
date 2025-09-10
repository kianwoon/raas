'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { modelCardApi } from '@/lib/api/model-card';
import { ModelCard } from '@/types/model-card';

export default function EditModelCardPage() {
  const params = useParams();
  const router = useRouter();
  const modelCardId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    version: '1.0.0',
    description: '',
    domain: '',
    risk_tier: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'draft' as 'draft' | 'pending_review' | 'approved' | 'deprecated',
    documentation_url: '',
    contact_email: '',
    tags: '',
    fairness_score: undefined as number | undefined,
  });

  const domainOptions = [
    { value: '', label: 'Select a domain' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'education', label: 'Education' },
    { value: 'government', label: 'Government' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'other', label: 'Other' }
  ];

  const riskTierOptions = [
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'critical', label: 'Critical Risk' }
  ];

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'deprecated', label: 'Deprecated' }
  ];

  useEffect(() => {
    const fetchModelCard = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await modelCardApi.getModelCard(modelCardId);
        const modelCard = response.model_card;
        
        setFormData({
          name: modelCard.name,
          version: modelCard.version,
          description: modelCard.description,
          domain: modelCard.domain,
          risk_tier: modelCard.risk_tier,
          status: modelCard.status,
          documentation_url: modelCard.documentation_url || '',
          contact_email: modelCard.contact_email || '',
          tags: modelCard.tags ? modelCard.tags.join(', ') : '',
          fairness_score: modelCard.fairness_score,
        });
      } catch (err) {
        console.error('Error fetching model card:', err);
        setError('Failed to load model card. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchModelCard();
  }, [modelCardId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fairness_score' ? (value ? parseFloat(value) : undefined) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const modelCardData = {
        ...formData,
        tags
      };

      await modelCardApi.updateModelCard(modelCardId, modelCardData);
      router.push(`/model-cards/${modelCardId}`);
    } catch (err) {
      console.error('Error updating model card:', err);
      setError('Failed to update model card. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Model Card</h3>
          <p className="text-gray-500 mb-4">{error}</p>
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
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Model Card
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Model Card</h1>
            <p className="text-gray-600">
              Update the transparency information for your AI model.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Model Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Enter model name"
                  />
                </div>
                
                {/* Version */}
                <div>
                  <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
                    Version <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="version"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="e.g., 1.0.0"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="form-textarea"
                    placeholder="Provide a detailed description of the model"
                  />
                </div>
                
                {/* Domain */}
                <div>
                  <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                    Domain <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    {domainOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Risk Tier */}
                <div>
                  <label htmlFor="risk_tier" className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Tier <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="risk_tier"
                    name="risk_tier"
                    value={formData.risk_tier}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  >
                    {riskTierOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Fairness Score */}
                <div>
                  <label htmlFor="fairness_score" className="block text-sm font-medium text-gray-700 mb-1">
                    Fairness Score (0-1)
                  </label>
                  <input
                    type="number"
                    id="fairness_score"
                    name="fairness_score"
                    value={formData.fairness_score || ''}
                    onChange={handleInputChange}
                    min="0"
                    max="1"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g., 0.85"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Optional: Overall fairness score for the model (between 0 and 1)
                  </p>
                </div>
                
                {/* Documentation URL */}
                <div>
                  <label htmlFor="documentation_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Documentation URL
                  </label>
                  <input
                    type="url"
                    id="documentation_url"
                    name="documentation_url"
                    value={formData.documentation_url}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://example.com/documentation"
                  />
                </div>
                
                {/* Contact Email */}
                <div>
                  <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="contact@example.com"
                  />
                </div>
                
                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate multiple tags with commas
                  </p>
                </div>
                
                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}