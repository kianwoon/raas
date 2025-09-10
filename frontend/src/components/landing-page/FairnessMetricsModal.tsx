'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FairnessMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FairnessMetricsModal({ isOpen, onClose }: FairnessMetricsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const fairnessMetrics = [
    {
      name: 'Statistical Parity',
      description: 'Requires that predictions be independent of protected attributes',
      formula: 'P(Ŷ=1 | A=0) = P(Ŷ=1 | A=1)',
      useCase: 'Hiring algorithms, loan approvals',
      importance: 'High',
      threshold: '≥ 0.8'
    },
    {
      name: 'Equal Opportunity',
      description: 'Requires that true positive rates be equal across different groups',
      formula: 'P(Ŷ=1 | A=0, Y=1) = P(Ŷ=1 | A=1, Y=1)',
      useCase: 'Medical diagnosis, credit scoring',
      importance: 'High',
      threshold: '≥ 0.8'
    },
    {
      name: 'Predictive Parity',
      description: 'Requires that precision be equal across different groups',
      formula: 'P(Y=1 | A=0, Ŷ=1) = P(Y=1 | A=1, Ŷ=1)',
      useCase: 'Risk assessment, classification systems',
      importance: 'Medium',
      threshold: '≥ 0.75'
    },
    {
      name: 'Disparate Impact',
      description: 'Measures the ratio of favorable outcomes between groups',
      formula: 'P(Ŷ=1 | A=1) / P(Ŷ=1 | A=0)',
      useCase: 'Employment, housing, lending',
      importance: 'High',
      threshold: '0.8 - 1.25'
    },
    {
      name: 'Equalized Odds',
      description: 'Requires equal false positive and true positive rates across groups',
      formula: 'P(Ŷ=1 | A=0, Y=y) = P(Ŷ=1 | A=1, Y=y) for y ∈ {0,1}',
      useCase: 'Criminal justice, healthcare',
      importance: 'High',
      threshold: '≥ 0.8'
    },
    {
      name: 'Individual Fairness',
      description: 'Similar individuals should receive similar treatment',
      formula: 'd(x, x\') ≤ δ ⇒ |f(x) - f(x\')| ≤ ε',
      useCase: 'Recommendation systems, personalized services',
      importance: 'Medium',
      threshold: 'Context-dependent'
    }
  ];

  const bestPractices = [
    {
      title: 'Data Representation',
      description: 'Ensure diverse and representative training data',
      tips: [
        'Audit datasets for demographic representation',
        'Use stratified sampling techniques',
        'Consider synthetic data generation for underrepresented groups'
      ]
    },
    {
      title: 'Bias Detection',
      description: 'Regular testing for bias throughout the ML lifecycle',
      tips: [
        'Conduct bias assessments before deployment',
        'Monitor for bias drift in production',
        'Use multiple fairness metrics for comprehensive evaluation'
      ]
    },
    {
      title: 'Bias Mitigation',
      description: 'Strategies to reduce or eliminate bias',
      tips: [
        'Pre-processing: Modify training data',
        'In-processing: Add fairness constraints to model training',
        'Post-processing: Adjust model predictions'
      ]
    },
    {
      title: 'Continuous Monitoring',
      description: 'Ongoing fairness assessment in production',
      tips: [
        'Set up automated fairness monitoring',
        'Establish alert thresholds for fairness violations',
        'Regular audits and stakeholder reviews'
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Learn About Fairness Metrics</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {['overview', 'metrics', 'practices', 'resources'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">Why Fairness Matters</h3>
                <p className="text-blue-800 mb-4">
                  Fair AI systems ensure equitable treatment across all demographic groups, preventing discrimination and building trust with users and stakeholders.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Benefits of Fair AI</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Increased user trust and adoption</li>
                      <li>• Regulatory compliance</li>
                      <li>• Reduced legal risks</li>
                      <li>• Better decision quality</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Key Challenges</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Multiple definitions of fairness</li>
                      <li>• Trade-offs between metrics</li>
                      <li>• Context-dependent requirements</li>
                      <li>• Evolving societal norms</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-900 mb-3">Our Approach</h3>
                <p className="text-green-800">
                  Our platform provides comprehensive fairness assessment tools to help organizations identify, measure, and mitigate bias in their AI systems. We believe in continuous improvement and transparency throughout the AI lifecycle.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Fairness Metrics</h3>
              <div className="grid gap-4">
                {fairnessMetrics.map((metric, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{metric.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        metric.importance === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {metric.importance} Priority
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{metric.description}</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Formula:</span>
                        <code className="block mt-1 p-2 bg-gray-100 rounded text-xs">{metric.formula}</code>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Use Cases:</span>
                        <p className="mt-1 text-gray-600">{metric.useCase}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium text-gray-900">Recommended Threshold:</span>
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {metric.threshold}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'practices' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Best Practices</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {bestPractices.map((practice, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{practice.title}</h4>
                    <p className="text-gray-600 mb-4">{practice.description}</p>
                    <ul className="space-y-2">
                      {practice.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-sm text-gray-600">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Resources</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">Learning Resources</h4>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/resources/glossary" className="text-blue-600 hover:text-blue-800 text-sm">
                        → Comprehensive AI Glossary
                      </Link>
                    </li>
                    <li>
                      <Link href="/resources/guides" className="text-blue-600 hover:text-blue-800 text-sm">
                        → Implementation Guides
                      </Link>
                    </li>
                    <li>
                      <Link href="/resources/tutorials" className="text-blue-600 hover:text-blue-800 text-sm">
                        → Step-by-Step Tutorials
                      </Link>
                    </li>
                    <li>
                      <Link href="/resources/case-studies" className="text-blue-600 hover:text-blue-800 text-sm">
                        → Real-World Case Studies
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-green-900 mb-3">Tools & Frameworks</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• AI Fairness 360 Toolkit</li>
                    <li>• Fairlearn Library</li>
                    <li>• Google What-If Tool</li>
                    <li>• IBM AI Explainability 360</li>
                    <li>• Microsoft Fairlearn</li>
                  </ul>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-yellow-900 mb-3">Get Started</h4>
                <p className="text-yellow-800 mb-4">
                  Ready to implement fairness metrics in your AI systems? Our platform provides comprehensive tools and guidance to help you get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/model-cards/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-center text-sm font-medium"
                  >
                    Create Your First Model Card
                  </Link>
                  <Link
                    href="/resources"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-center text-sm font-medium"
                  >
                    Explore All Resources
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}