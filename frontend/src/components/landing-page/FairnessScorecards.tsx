'use client';

import { useState, useEffect } from 'react';
import { FairnessMetricsModal } from './FairnessMetricsModal';

interface FairnessScorecardsProps {
  fairnessDistribution: Record<string, number>;
}

export function FairnessScorecards({ fairnessDistribution }: FairnessScorecardsProps) {
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getBarColor = (scoreRange: string) => {
    if (scoreRange.includes('0.95-1.0')) return 'bg-green-500';
    if (scoreRange.includes('0.85-0.95')) return 'bg-green-400';
    if (scoreRange.includes('0.7-0.85')) return 'bg-yellow-400';
    if (scoreRange.includes('0.5-0.7')) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getScoreLabel = (scoreRange: string) => {
    if (scoreRange.includes('0.95-1.0')) return 'Excellent';
    if (scoreRange.includes('0.85-0.95')) return 'Good';
    if (scoreRange.includes('0.7-0.85')) return 'Fair';
    if (scoreRange.includes('0.5-0.7')) return 'Needs Improvement';
    return 'Poor';
  };

  // Calculate total for percentage calculations
  const total = Object.values(fairnessDistribution).reduce((sum, count) => sum + count, 0);

  return (
    <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Fairness Score Distribution</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Overview of fairness scores across all AI models in our platform, helping identify areas for improvement.
        </p>
      </div>
      
      <div className="space-y-6">
        {Object.entries(fairnessDistribution).map(([scoreRange, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={scoreRange} className="space-y-2">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700">{scoreRange}</span>
                  <span className="ml-2 text-sm text-gray-500">({getScoreLabel(scoreRange)})</span>
                </div>
                <span className="font-medium text-gray-700">{count} models ({percentage.toFixed(1)}%)</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`${getBarColor(scoreRange)} h-4 rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-5">
          <h3 className="font-bold text-lg text-blue-800 mb-2">Why Fairness Matters</h3>
          <p className="text-blue-700">
            Fair AI systems ensure equitable treatment across all demographic groups, preventing discrimination and building trust with users and stakeholders.
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-5">
          <h3 className="font-bold text-lg text-green-800 mb-2">Improving Fairness</h3>
          <p className="text-green-700">
            Our platform provides tools and guidelines to help organizations identify and mitigate bias in their AI models through comprehensive assessments.
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
        >
          Learn About Fairness Metrics
        </button>
      </div>
      
      <FairnessMetricsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}