'use client';

import { useState, useEffect } from 'react';
import { DetailedAnalyticsModal } from '@/components/landing-page/DetailedAnalyticsModal';
import { landingPageApi } from '@/lib/api/landing-page';

interface AnalyticsData {
  total_model_cards: number;
  average_fairness_score: number;
  domain_distribution: Record<string, number>;
  risk_tier_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
}

interface UserActivity {
  date: string;
  active_users: number;
  page_views: number;
  model_views: number;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  response_time: number;
  uptime: string;
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [isDetailedModalOpen, setIsDetailedModalOpen] = useState(false);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch analytics data
        const [analyticsResponse] = await Promise.all([
          landingPageApi.getModelCardStatistics({ use_sample_data: true })
        ]);
        
        setAnalyticsData(analyticsResponse);
        
        // Mock user activity data for demonstration
        const mockUserActivity: UserActivity[] = [
          { date: '2024-01-01', active_users: 1200, page_views: 5400, model_views: 1200 },
          { date: '2024-01-02', active_users: 1350, page_views: 6200, model_views: 1450 },
          { date: '2024-01-03', active_users: 1180, page_views: 5100, model_views: 1100 },
          { date: '2024-01-04', active_users: 1420, page_views: 6800, model_views: 1600 },
          { date: '2024-01-05', active_users: 1580, page_views: 7200, model_views: 1800 },
          { date: '2024-01-06', active_users: 1650, page_views: 7500, model_views: 1900 },
          { date: '2024-01-07', active_users: 1720, page_views: 8100, model_views: 2100 },
        ];
        
        setUserActivity(mockUserActivity);
        
        // Mock system metrics
        setSystemMetrics({
          cpu_usage: 45.2,
          memory_usage: 67.8,
          response_time: 245,
          uptime: '15 days, 4 hours'
        });
        
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

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

  const exportReport = (format: 'pdf' | 'csv' | 'json') => {
    // Mock export functionality
    alert(`Exporting analytics report in ${format.toUpperCase()} format...`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Analytics Dashboard</h1>
              <p className="text-gray-600">
                Comprehensive analytics and insights for platform performance, user activity, and system metrics.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/admin/model-cards"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Model Cards
              </a>
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
              <div className="flex gap-2">
                <button
                  onClick={() => exportReport('pdf')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                >
                  Export PDF
                </button>
                <button
                  onClick={() => exportReport('csv')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Models</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{analyticsData.total_model_cards}</div>
              <div className="text-sm text-green-600">↑ 12% vs last period</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Avg Fairness</h3>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {(analyticsData.average_fairness_score * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-green-600">↑ 3.2% vs last period</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1,724</div>
              <div className="text-sm text-green-600">↑ 8% vs last period</div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">98.2%</div>
              <div className="text-sm text-green-600">↑ 1.5% vs last period</div>
            </div>
          </div>
        )}

        {/* Charts and Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Distribution Charts */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Model Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analyticsData && (
                <>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">By Domain</h4>
                    <div className="space-y-2">
                      {Object.entries(analyticsData.domain_distribution)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([domain, count]) => (
                          <div key={domain} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{domain}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`${getDomainColor(domain)} h-2 rounded-full`}
                                  style={{ width: `${(count / analyticsData.total_model_cards) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{count}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">By Risk Tier</h4>
                    <div className="space-y-2">
                      {Object.entries(analyticsData.risk_tier_distribution || {}).map(([tier, count]) => (
                        <div key={tier} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{tier}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${getRiskTierColor(tier)} h-2 rounded-full`}
                                style={{ width: `${(count / analyticsData.total_model_cards) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">By Status</h4>
                    <div className="space-y-2">
                      {Object.entries(analyticsData.status_distribution || {}).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`${getStatusColor(status)} h-2 rounded-full`}
                                style={{ width: `${(count / analyticsData.total_model_cards) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* User Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">User Activity Trends</h3>
            <div className="space-y-4">
              {userActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{activity.date}</div>
                    <div className="text-sm text-gray-500">
                      {activity.active_users} active users
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {activity.page_views.toLocaleString()} page views
                    </div>
                    <div className="text-sm text-gray-600">
                      {activity.model_views.toLocaleString()} model views
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Metrics */}
        {systemMetrics && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">System Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{systemMetrics.cpu_usage}%</div>
                <div className="text-sm text-gray-600">CPU Usage</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      systemMetrics.cpu_usage > 80 ? 'bg-red-500' :
                      systemMetrics.cpu_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${systemMetrics.cpu_usage}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{systemMetrics.memory_usage}%</div>
                <div className="text-sm text-gray-600">Memory Usage</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      systemMetrics.memory_usage > 80 ? 'bg-red-500' :
                      systemMetrics.memory_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${systemMetrics.memory_usage}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{systemMetrics.response_time}ms</div>
                <div className="text-sm text-gray-600">Response Time</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      systemMetrics.response_time > 500 ? 'bg-red-500' :
                      systemMetrics.response_time > 300 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (systemMetrics.response_time / 1000) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{systemMetrics.uptime}</div>
                <div className="text-sm text-gray-600">System Uptime</div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Healthy
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setIsDetailedModalOpen(true)}
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="font-medium text-gray-900">Detailed Analytics</div>
              <div className="text-sm text-gray-600">View comprehensive analytics</div>
            </button>

            <a
              href="/admin/model-cards"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left block"
            >
              <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="font-medium text-gray-900">Manage Models</div>
              <div className="text-sm text-gray-600">Administer model cards</div>
            </a>

            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
              <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div className="font-medium text-gray-900">Generate Reports</div>
              <div className="text-sm text-gray-600">Create custom reports</div>
            </button>

            <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-left">
              <div className="w-8 h-8 bg-yellow-200 rounded-lg flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="font-medium text-gray-900">Settings</div>
              <div className="text-sm text-gray-600">Configure analytics</div>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Modal */}
      {analyticsData && (
        <DetailedAnalyticsModal
          isOpen={isDetailedModalOpen}
          onClose={() => setIsDetailedModalOpen(false)}
          statistics={analyticsData}
        />
      )}
    </div>
  );
}