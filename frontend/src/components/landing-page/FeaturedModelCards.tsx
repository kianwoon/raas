'use client';

import Link from 'next/link';

interface ModelCard {
  id: string;
  name: string;
  version: string;
  description: string;
  domain: string;
  risk_tier: string;
  status: string;
  fairness_score?: number;
  organization_id: string;
  documentation_url?: string;
  contact_email?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

interface FeaturedModelCardsProps {
  modelCards: ModelCard[];
}

export function FeaturedModelCards({ modelCards }: FeaturedModelCardsProps) {
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

  const getFairnessScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.7) return 'text-yellow-500';
    if (score >= 0.6) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Model Cards</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore transparent documentation of AI models with comprehensive fairness assessments and compliance information.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modelCards.map((modelCard) => (
          <div key={modelCard.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{modelCard.name}</h3>
                  <p className="text-sm text-gray-500">Version {modelCard.version}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskTierColor(modelCard.risk_tier)}`}>
                  {modelCard.risk_tier.charAt(0).toUpperCase() + modelCard.risk_tier.slice(1)} Risk
                </span>
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
      
      <div className="text-center mt-12">
        <Link 
          href="/model-cards"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
        >
          View All Model Cards
        </Link>
      </div>
    </section>
  );
}