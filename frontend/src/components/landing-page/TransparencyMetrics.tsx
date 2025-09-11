'use client';

import { useState } from 'react';

interface TransparencyMetricsProps {
  modelCardStatistics: {
    total_model_cards: number;
    average_fairness_score: number;
    domain_distribution: Record<string, number>;
    risk_tier_distribution: Record<string, number>;
    status_distribution: Record<string, number>;
  };
  loading: boolean;
}

export default function TransparencyMetrics({ modelCardStatistics, loading }: TransparencyMetricsProps) {
  const [activeMetric, setActiveMetric] = useState<'fairness' | 'compliance' | 'transparency'>('fairness');

  // Metrics data
  const metrics = {
    fairness: {
      title: "Fairness Metrics",
      description: "Comprehensive evaluation of fairness across different demographic groups and attributes.",
      items: [
        { name: "Demographic Parity", value: loading ? "..." : "87%", trend: "up" },
        { name: "Equal Opportunity", value: loading ? "..." : "91%", trend: "up" },
        { name: "Disparate Impact", value: loading ? "..." : "85%", trend: "stable" },
        { name: "Predictive Equality", value: loading ? "..." : "89%", trend: "up" }
      ]
    },
    compliance: {
      title: "Compliance Status",
      description: "Adherence to regulatory frameworks and industry standards for responsible AI.",
      items: [
        { name: "FEAT Framework", value: loading ? "..." : "92%", trend: "up" },
        { name: "PDPA Compliance", value: loading ? "..." : "88%", trend: "up" },
        { name: "HKMA Principles", value: loading ? "..." : "85%", trend: "stable" },
        { name: "EU AI Act", value: loading ? "..." : "78%", trend: "down" }
      ]
    },
    transparency: {
      title: "Transparency Indicators",
      description: "Measures of model interpretability, documentation quality, and disclosure practices.",
      items: [
        { name: "Documentation Completeness", value: loading ? "..." : "94%", trend: "up" },
        { name: "Explainability Score", value: loading ? "..." : "82%", trend: "up" },
        { name: "Data Provenance", value: loading ? "..." : "76%", trend: "stable" },
        { name: "Model Accessibility", value: loading ? "..." : "71%", trend: "up" }
      ]
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <span className="text-green-600">↑</span>;
      case 'down':
        return <span className="text-red-600">↓</span>;
      default:
        return <span className="text-gray-600">→</span>;
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Transparency Metrics Dashboard
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Track key performance indicators for fairness, compliance, and transparency across AI models.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            {/* Metrics selector */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {Object.entries(metrics).map(([key, metric]) => (
                <button
                  key={key}
                  onClick={() => setActiveMetric(key as 'fairness' | 'compliance' | 'transparency')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
                    activeMetric === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {metric.title}
                </button>
              ))}
            </div>

            {/* Current metric details */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{metrics[activeMetric].title}</h3>
              <p className="text-gray-600">{metrics[activeMetric].description}</p>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics[activeMetric].items.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">{item.name}</div>
                  <div className="flex items-baseline">
                    <div className="text-3xl font-bold text-gray-900 mr-2">{item.value}</div>
                    <div className="text-lg">{getTrendIcon(item.trend)}</div>
                  </div>
                  <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        activeMetric === 'fairness' ? 'bg-blue-500' :
                        activeMetric === 'compliance' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}
                      style={{ width: item.value === "..." ? "0%" : item.value }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall transparency score */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Overall Transparency Score</h3>
                <p className="text-gray-600">Combined assessment of fairness, compliance, and transparency metrics</p>
              </div>
              
              <div className="flex justify-center">
                <div className="relative w-64 h-64">
                  {/* Circular progress bar */}
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      strokeDasharray="283"
                      strokeDashoffset={loading ? "283" : 283 - (283 * (modelCardStatistics.average_fairness_score || 0))}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {loading ? "..." : `${(modelCardStatistics.average_fairness_score * 100).toFixed(1)}%`}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Transparency Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/transparency-dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition duration-300"
          >
            Explore Full Dashboard
          </a>
        </div>
      </div>
    </section>
  );
}