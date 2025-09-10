'use client';

import { useState } from 'react';
import { DetailedAnalyticsModal } from './DetailedAnalyticsModal';

interface StatisticsProps {
  statistics: {
    total_model_cards: number;
    average_fairness_score: number;
    domain_distribution: Record<string, number>;
    risk_tier_distribution: Record<string, number>;
    status_distribution: Record<string, number>;
  };
}

export function TransparencyMetricsDashboard({ statistics }: StatisticsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const getRiskTierColor = (tier: string) => {
    switch (tier) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'pending_review':
        return 'bg-yellow-500';
      case 'draft':
        return 'bg-blue-500';
      case 'deprecated':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDomainColor = (domain: string) => {
    const colors = [
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-teal-500',
      'bg-cyan-500'
    ];
    
    // Simple hash function to get consistent color for same domain
    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
      hash = domain.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Transparency Metrics Dashboard</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Key metrics showing the state of AI transparency across different dimensions in our platform.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-blue-50 rounded-lg p-5 text-center">
          <div className="text-3xl font-bold text-blue-700 mb-2">{statistics.total_model_cards}</div>
          <div className="text-blue-600 font-medium">Total Model Cards</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-5 text-center">
          <div className="text-3xl font-bold text-green-700 mb-2">
            {(statistics.average_fairness_score * 100).toFixed(1)}%
          </div>
          <div className="text-green-600 font-medium">Avg. Fairness Score</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-5 text-center">
          <div className="text-3xl font-bold text-purple-700 mb-2">
            {Object.keys(statistics.domain_distribution).length}
          </div>
          <div className="text-purple-600 font-medium">Domains Covered</div>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-5 text-center">
          <div className="text-3xl font-bold text-yellow-700 mb-2">
            {statistics.status_distribution.approved || 0}
          </div>
          <div className="text-yellow-600 font-medium">Approved Models</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Domain Distribution */}
        <div className="bg-gray-50 rounded-lg p-5">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Domain Distribution</h3>
          <div className="space-y-3">
            {Object.entries(statistics.domain_distribution).map(([domain, count]) => (
              <div key={domain} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{domain}</span>
                  <span className="text-gray-500">{count} models</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${getDomainColor(domain)} h-2 rounded-full`}
                    style={{ width: `${(count / statistics.total_model_cards) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Risk Tier Distribution */}
        <div className="bg-gray-50 rounded-lg p-5">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Risk Tier Distribution</h3>
          <div className="space-y-3">
            {Object.entries(statistics.risk_tier_distribution).map(([tier, count]) => (
              <div key={tier} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700 capitalize">{tier}</span>
                  <span className="text-gray-500">{count} models</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${getRiskTierColor(tier)} h-2 rounded-full`}
                    style={{ width: `${(count / statistics.total_model_cards) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Status Distribution */}
        <div className="bg-gray-50 rounded-lg p-5">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(statistics.status_distribution).map(([status, count]) => (
              <div key={status} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                  <span className="text-gray-500">{count} models</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${getStatusColor(status)} h-2 rounded-full`}
                    style={{ width: `${(count / statistics.total_model_cards) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
        >
          Explore Detailed Analytics
        </button>
      </div>
      
      <DetailedAnalyticsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        statistics={statistics}
      />
    </section>
  );
}