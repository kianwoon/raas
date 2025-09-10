'use client';

import { useState, useEffect } from 'react';

interface ModelCardFiltersProps {
  filters: {
    page: number;
    size: number;
    domain: string;
    risk_tier: string;
    status: string;
    search: string;
  };
  onFilterChange: (filters: Partial<ModelCardFiltersProps['filters']>) => void;
}

export function ModelCardFilters({ filters, onFilterChange }: ModelCardFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  
  // Domain options
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

  // Handle search input with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput });
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    onFilterChange({ [key]: value });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    onFilterChange({
      domain: '',
      risk_tier: '',
      status: '',
      search: ''
    });
  };

  const hasActiveFilters = filters.domain || filters.risk_tier || filters.status || filters.search;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Reset All
          </button>
        )}
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <input
          type="text"
          id="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search model cards..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {/* Domain Filter */}
      <div className="mb-6">
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
          Domain
        </label>
        <select
          id="domain"
          value={filters.domain}
          onChange={(e) => handleFilterChange('domain', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {domainOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Risk Tier Filter */}
      <div className="mb-6">
        <label htmlFor="risk_tier" className="block text-sm font-medium text-gray-700 mb-1">
          Risk Tier
        </label>
        <select
          id="risk_tier"
          value={filters.risk_tier}
          onChange={(e) => handleFilterChange('risk_tier', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {riskTierOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Status Filter */}
      <div className="mb-6">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h3>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: {filters.search}
                <button
                  type="button"
                  className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                  onClick={() => {
                    setSearchInput('');
                    handleFilterChange('search', '');
                  }}
                >
                  <span className="sr-only">Remove filter</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6l-6 6" />
                  </svg>
                </button>
              </span>
            )}
            
            {filters.domain && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Domain: {domainOptions.find(d => d.value === filters.domain)?.label}
                <button
                  type="button"
                  className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                  onClick={() => handleFilterChange('domain', '')}
                >
                  <span className="sr-only">Remove filter</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6l-6 6" />
                  </svg>
                </button>
              </span>
            )}
            
            {filters.risk_tier && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Risk: {riskTierOptions.find(r => r.value === filters.risk_tier)?.label}
                <button
                  type="button"
                  className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                  onClick={() => handleFilterChange('risk_tier', '')}
                >
                  <span className="sr-only">Remove filter</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6l-6 6" />
                  </svg>
                </button>
              </span>
            )}
            
            {filters.status && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {statusOptions.find(s => s.value === filters.status)?.label}
                <button
                  type="button"
                  className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                  onClick={() => handleFilterChange('status', '')}
                >
                  <span className="sr-only">Remove filter</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6l-6 6" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}