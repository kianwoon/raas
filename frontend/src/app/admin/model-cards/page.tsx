'use client';

import { useState, useEffect } from 'react';
import { ModelCard } from '@/types/model-card';
import { modelCardApi } from '@/lib/api/model-card';

export default function AdminModelCardsPage() {
  const [modelCards, setModelCards] = useState<ModelCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    skip: 0,
    limit: 20,
    domain: '',
    risk_tier: '',
    status: '',
    search: ''
  });
  const [total, setTotal] = useState(0);
  const [selectedModelCards, setSelectedModelCards] = useState<string[]>([]);

  useEffect(() => {
    const fetchModelCards = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await modelCardApi.getModelCards({
          skip: filters.skip,
          limit: filters.limit,
          domain: filters.domain || undefined,
          risk_tier: filters.risk_tier || undefined,
          status: filters.status || undefined,
          search: filters.search || undefined
        });
        
        setModelCards(response.models);
        setTotal(response.total);
      } catch (err) {
        console.error('Error fetching model cards:', err);
        setError('Failed to load model cards. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchModelCards();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      skip: 0 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      skip: (page - 1) * prev.limit
    }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedModelCards(modelCards.map(card => card.id));
    } else {
      setSelectedModelCards([]);
    }
  };

  const handleSelectCard = (id: string) => {
    if (selectedModelCards.includes(id)) {
      setSelectedModelCards(selectedModelCards.filter(cardId => cardId !== id));
    } else {
      setSelectedModelCards([...selectedModelCards, id]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedModelCards.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedModelCards.length} model card(s)?`)) {
      return;
    }
    
    try {
      await Promise.all(selectedModelCards.map(id => modelCardApi.deleteModelCard(id)));
      setSelectedModelCards([]);
      
      // Refresh the list
      const response = await modelCardApi.getModelCards({
        skip: filters.skip,
        limit: filters.limit,
        domain: filters.domain || undefined,
        risk_tier: filters.risk_tier || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined
      });
      
      setModelCards(response.models);
      setTotal(response.total);
    } catch (err) {
      console.error('Error deleting model cards:', err);
      setError('Failed to delete model cards. Please try again later.');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (selectedModelCards.length === 0) return;
    
    try {
      await Promise.all(selectedModelCards.map(id => 
        modelCardApi.updateModelCard(id, { status })
      ));
      setSelectedModelCards([]);
      
      // Refresh the list
      const response = await modelCardApi.getModelCards({
        skip: filters.skip,
        limit: filters.limit,
        domain: filters.domain || undefined,
        risk_tier: filters.risk_tier || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined
      });
      
      setModelCards(response.models);
      setTotal(response.total);
    } catch (err) {
      console.error('Error updating model cards:', err);
      setError('Failed to update model cards. Please try again later.');
    }
  };

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

  // Calculate current page from skip and limit
  const currentPage = Math.floor(filters.skip / filters.limit) + 1;
  const totalPages = Math.ceil(total / filters.limit);

  const domainOptions = [
    { value: '', label: 'All Domains' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'education', label: 'Education' },
    { value: 'government', label: 'Government' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'other', label: 'Other' }
  ];
  
  // Risk tier options
  const riskTierOptions = [
    { value: '', label: 'All Risk Tiers' },
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'critical', label: 'Critical Risk' }
  ];
  
  // Status options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'deprecated', label: 'Deprecated' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Model Card Management</h1>
              <p className="text-gray-600">
                Administer AI model cards, update status, and manage transparency documentation.
              </p>
            </div>
            <a
              href="/admin/analytics"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics Dashboard
            </a>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search model cards..."
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="form-input"
              />
            </div>
            
            <div className="min-w-[150px]">
              <select
                className="form-select"
                value={filters.domain}
                onChange={(e) => handleFilterChange({ domain: e.target.value })}
                className="form-input"
              >
                {domainOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="min-w-[150px]">
              <select
                className="form-select"
                value={filters.risk_tier}
                onChange={(e) => handleFilterChange({ risk_tier: e.target.value })}
                className="form-input"
              >
                {riskTierOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="min-w-[150px]">
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
                className="form-input"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Showing <span className="font-medium">{(currentPage - 1) * filters.limit + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * filters.limit, total)}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </p>
            
            <div className="flex gap-2">
              {selectedModelCards.length > 0 && (
                <>
                  <select
                className="form-select"
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    defaultValue=""
                  >
                    <option value="" disabled>Update Status</option>
                    <option value="draft">Draft</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="deprecated">Deprecated</option>
                  </select>
                  
                  <button
                    onClick={handleDeleteSelected}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete ({selectedModelCards.length})
                  </button>
                </>
              )}
              
              <a
                href="/model-cards/create"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create New
              </a>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Model Cards</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          ) : modelCards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Model Cards Found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your filters or create a new model card.
              </p>
              <a
                href="/model-cards/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create a Model Card
              </a>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedModelCards.length === modelCards.length && modelCards.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Domain
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk Tier
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fairness Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {modelCards.map((modelCard) => (
                      <tr key={modelCard.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedModelCards.includes(modelCard.id)}
                            onChange={() => handleSelectCard(modelCard.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{modelCard.name}</div>
                          <div className="text-sm text-gray-500">v{modelCard.version}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {modelCard.domain}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskTierColor(modelCard.risk_tier)}`}>
                            {modelCard.risk_tier.charAt(0).toUpperCase() + modelCard.risk_tier.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(modelCard.status)}`}>
                            {modelCard.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {modelCard.fairness_score !== undefined ? (
                            <span className={(modelCard.fairness_score >= 0.8) ? 'text-green-600 font-medium' : (modelCard.fairness_score >= 0.6) ? 'text-yellow-600 font-medium' : 'text-red-600 font-medium'}>
                              {(modelCard.fairness_score * 100).toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">Not assessed</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <a href={`/model-cards/${modelCard.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                            View
                          </a>
                          <a href={`/model-cards/${modelCard.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Current page */}
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                          {currentPage}
                        </span>
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === totalPages
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}