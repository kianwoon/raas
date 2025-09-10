'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DetailedAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statistics: {
    total_model_cards: number;
    average_fairness_score: number;
    domain_distribution: Record<string, number>;
    risk_tier_distribution: Record<string, number>;
    status_distribution: Record<string, number>;
  };
}

export function DetailedAnalyticsModal({ isOpen, onClose, statistics }: DetailedAnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  const getRiskTierColor = (tier: string) => {
    switch (tier) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending_review': return 'bg-yellow-500';
      case 'draft': return 'bg-blue-500';
      case 'deprecated': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getDomainColor = (domain: string) => {
    const colors = [
      'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
      'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
      'bg-teal-500', 'bg-cyan-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
      hash = domain.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const trends = [
    { metric: 'Total Models', current: statistics.total_model_cards, change: '+12%', period: 'vs last month' },
    { metric: 'Fairness Score', current: `${(statistics.average_fairness_score * 100).toFixed(1)}%`, change: '+3.2%', period: 'vs last month' },
    { metric: 'High-Risk Models', current: statistics.risk_tier_distribution?.high || 0, change: '-8%', period: 'vs last month' },
    { metric: 'Compliance Rate', current: '89%', change: '+5%', period: 'vs last month' }
  ];

  const insights = [
    {
      type: 'positive',
      title: 'Improved Fairness Performance',
      description: 'Average fairness scores have increased by 3.2% across all domains',
      impact: 'High',
      recommendation: 'Continue current bias mitigation strategies'
    },
    {
      type: 'warning',
      title: 'Domain Imbalance Detected',
      description: 'Healthcare and Finance domains represent 65% of all models',
      impact: 'Medium',
      recommendation: 'Encourage model submissions from underrepresented domains'
    },
    {
      type: 'info',
      title: 'Compliance Framework Adoption',
      description: '87% of approved models now include compliance framework information',
      impact: 'Medium',
      recommendation: 'Focus on remaining 13% to achieve full coverage'
    }
  ];

  const detailedMetrics = [
    {
      category: 'Fairness Metrics',
      items: [
        { name: 'Demographic Parity', value: '87%', trend: 'up', target: '90%' },
        { name: 'Equal Opportunity', value: '91%', trend: 'up', target: '90%' },
        { name: 'Disparate Impact', value: '85%', trend: 'stable', target: '80%' },
        { name: 'Predictive Parity', value: '89%', trend: 'up', target: '85%' }
      ]
    },
    {
      category: 'Compliance Metrics',
      items: [
        { name: 'Documentation Completeness', value: '94%', trend: 'up', target: '95%' },
        { name: 'Audit Trail Coverage', value: '82%', trend: 'up', target: '90%' },
        { name: 'Risk Assessment Rate', value: '76%', trend: 'stable', target: '85%' },
        { name: 'Framework Alignment', value: '88%', trend: 'up', target: '90%' }
      ]
    },
    {
      category: 'Operational Metrics',
      items: [
        { name: 'Model Update Frequency', value: '2.3/month', trend: 'up', target: '2/month' },
        { name: 'Review Processing Time', value: '3.2 days', trend: 'down', target: '2 days' },
        { name: 'User Engagement', value: '67%', trend: 'up', target: '75%' },
        { name: 'Data Quality Score', value: '91%', trend: 'stable', target: '90%' }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Detailed Analytics Dashboard</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {['overview', 'metrics', 'trends', 'insights'].map((tab) => (
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
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">{statistics.total_model_cards}</div>
                  <div className="text-sm text-blue-600">Total Models</div>
                  <div className="text-xs text-green-600 mt-1">↑ 12% vs last month</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-700">
                    {(statistics.average_fairness_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-600">Avg Fairness</div>
                  <div className="text-xs text-green-600 mt-1">↑ 3.2% vs last month</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-700">
                    {Object.keys(statistics.domain_distribution).length}
                  </div>
                  <div className="text-sm text-purple-600">Active Domains</div>
                  <div className="text-xs text-blue-600 mt-1">↑ 2 vs last month</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-700">
                    {statistics.status_distribution?.approved || 0}
                  </div>
                  <div className="text-sm text-yellow-600">Approved</div>
                  <div className="text-xs text-green-600 mt-1">↑ 8% vs last month</div>
                </div>
              </div>

              {/* Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Domain Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(statistics.domain_distribution)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([domain, count]) => (
                        <div key={domain} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">{domain}</span>
                            <span className="text-gray-500">{count}</span>
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

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Risk Tier Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(statistics.risk_tier_distribution || {}).map(([tier, count]) => (
                      <div key={tier} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700 capitalize">{tier}</span>
                          <span className="text-gray-500">{count}</span>
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

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Status Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(statistics.status_distribution || {}).map(([status, count]) => (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                          <span className="text-gray-500">{count}</span>
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
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Performance Metrics</h3>
              {detailedMetrics.map((category, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="bg-white rounded-lg p-4 border">
                        <div className="text-sm text-gray-500 mb-1">{item.name}</div>
                        <div className="flex items-baseline justify-between mb-2">
                          <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                          <div className={`text-sm ${
                            item.trend === 'up' ? 'text-green-600' : 
                            item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">Target: {item.target}</div>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              parseFloat(item.value) >= parseFloat(item.target) ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(100, (parseFloat(item.value) / parseFloat(item.target)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Performance Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trends.map((trend, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{trend.metric}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        trend.change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trend.change}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{trend.current}</div>
                    <div className="text-sm text-gray-500">{trend.period}</div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Trend Analysis</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2">Positive Trends</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Fairness scores consistently improving</li>
                      <li>• Model submission rate increasing</li>
                      <li>• Compliance framework adoption growing</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2">Areas for Improvement</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Review processing time needs reduction</li>
                      <li>• Domain diversity requires attention</li>
                      <li>• High-risk model mitigation needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Insights</h3>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`rounded-lg p-6 ${
                    insight.type === 'positive' ? 'bg-green-50 border border-green-200' :
                    insight.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{insight.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        insight.impact === 'High' ? 'bg-red-100 text-red-800' :
                        insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {insight.impact} Impact
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{insight.description}</p>
                    <div className="bg-white rounded-lg p-3">
                      <h5 className="font-medium text-gray-900 mb-1">Recommendation</h5>
                      <p className="text-sm text-gray-600">{insight.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-purple-900 mb-3">Export Options</h4>
                <p className="text-purple-800 mb-4">
                  Download detailed analytics reports for further analysis and reporting.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium">
                    Export to PDF
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium">
                    Export to CSV
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium">
                    Export to JSON
                  </button>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium">
                    Schedule Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Data updated: {new Date().toLocaleDateString()} | Time range: {timeRange}
            </div>
            <div className="flex gap-3">
              <Link
                href="/model-cards"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                View All Models
              </Link>
              <Link
                href="/admin/analytics"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                Full Analytics Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}