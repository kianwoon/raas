'use client';

import { useState, useEffect } from 'react';
import { ModelCard } from '@/types/model-card';
import { ModelCardList } from '@/components/model-cards/ModelCardList';
import { ModelCardFilters } from '@/components/model-cards/ModelCardFilters';
import { modelCardApi } from '@/lib/api/model-card';

export default function ModelCardsPage() {
  const [modelCards, setModelCards] = useState<ModelCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    skip: 0,
    limit: 12,
    domain: '',
    risk_tier: '',
    status: '',
    search: ''
  });
  const [total, setTotal] = useState(0);

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

  // Calculate current page from skip and limit
  const currentPage = Math.floor(filters.skip / filters.limit) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Model Cards</h1>
          <p className="text-gray-600">
            Explore transparent documentation of AI models with comprehensive fairness assessments and compliance information.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <ModelCardFilters 
              filters={{
                page: currentPage,
                size: filters.limit,
                domain: filters.domain,
                risk_tier: filters.risk_tier,
                status: filters.status,
                search: filters.search
              }} 
              onFilterChange={handleFilterChange} 
            />
          </div>
          
          <div className="lg:w-3/4">
            <ModelCardList 
              modelCards={modelCards}
              loading={loading}
              error={error}
              total={total}
              page={currentPage}
              size={filters.limit}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}