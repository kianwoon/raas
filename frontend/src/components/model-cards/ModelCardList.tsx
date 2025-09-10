'use client';

import { ModelCard } from '@/types/model-card';
import Link from 'next/link';

interface ModelCardListProps {
  modelCards: ModelCard[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  size: number;
  onPageChange: (page: number) => void;
}

export function ModelCardList({ 
  modelCards, 
  loading, 
  error, 
  total, 
  page, 
  size, 
  onPageChange 
}: ModelCardListProps) {
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

  const getFairnessScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.7) return 'text-yellow-500';
    if (score >= 0.6) return 'text-orange-500';
    return 'text-red-500';
  };

  const totalPages = Math.ceil(total / size);

  const handlePrevPage = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="text-center">
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
      </div>
    );
  }

  if (modelCards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Model Cards Found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or search terms.
          </p>
          <Link 
            href="/model-cards/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create a Model Card
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing <span className="font-medium">{(page - 1) * size + 1}</span> to{' '}
          <span className="font-medium">{Math.min(page * size, total)}</span> of{' '}
          <span className="font-medium">{total}</span> results
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modelCards.map((modelCard) => (
          <div key={modelCard.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{modelCard.name}</h3>
                  <p className="text-sm text-gray-500">Version {modelCard.version}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskTierColor(modelCard.risk_tier)}`}>
                    {modelCard.risk_tier.charAt(0).toUpperCase() + modelCard.risk_tier.slice(1)} Risk
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(modelCard.status)}`}>
                    {modelCard.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-3">{modelCard.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {modelCard.domain}
                </span>
                {modelCard.tags?.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fairness Score</p>
                  {modelCard.fairness_score !== undefined ? (
                    <div className={`text-2xl font-bold ${getFairnessScoreColor(modelCard.fairness_score)}`}>
                      {(modelCard.fairness_score * 100).toFixed(1)}%
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">Not assessed</div>
                  )}
                </div>
                
                <Link 
                  href={`/model-cards/${modelCard.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  View Details →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page === totalPages
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
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    page === 1
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
                  {page}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    page === totalPages
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
    </div>
  );
}