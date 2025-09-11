'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { apiKeyService, ApiKey, ApiKeyActivity } from '@/lib/api/api-keys';

export default function ApiKeysPage() {
  const { isAuthenticated: authStatus, loading: authLoading } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [activities, setActivities] = useState<ApiKeyActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked'>('all');
  const [filterEnvironment, setFilterEnvironment] = useState<'all' | 'development' | 'production'>('all');
  const [stats, setStats] = useState({
    total_keys: 0,
    active_keys: 0,
    total_usage: 0,
    monthly_usage: 0
  });
  const [newKey, setNewKey] = useState<{
    name: string;
    permissions: string[];
    environment: 'development' | 'production';
    rate_limit: number;
    ip_whitelist: string[];
    description?: string;
    expires_at?: string;
  }>({
    name: '',
    permissions: ['read'],
    environment: 'development',
    rate_limit: 1000,
    ip_whitelist: [],
    description: ''
  });
  const [createdKey, setCreatedKey] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Load API keys and stats from backend
  useEffect(() => {
    const loadData = async () => {
      if (!authStatus) return;
      
      try {
        setLoading(true);
        const [keys, keyStats] = await Promise.all([
          apiKeyService.getApiKeys(),
          apiKeyService.getApiKeyStats()
        ]);
        setApiKeys(keys);
        setStats(keyStats);
      } catch (error) {
        console.error('Error loading data:', error);
        // Handle various error types gracefully
        if (error.message?.includes('API client is not properly initialized') || 
            error.message?.includes('Cannot read properties of undefined')) {
          console.warn('API client not initialized, retrying in 2 seconds...');
          setTimeout(loadData, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    if (authStatus) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [authStatus]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const createdApiKey = await apiKeyService.createApiKey({
        name: newKey.name,
        environment: newKey.environment,
        permissions: newKey.permissions,
        rate_limit: newKey.rate_limit,
        ip_whitelist: newKey.ip_whitelist,
        description: newKey.description,
        expires_at: newKey.expires_at ? new Date(newKey.expires_at).toISOString() : undefined
      });
      
      // Refresh data to get updated stats
      const [keys, keyStats] = await Promise.all([
        apiKeyService.getApiKeys(),
        apiKeyService.getApiKeyStats()
      ]);
      
      setApiKeys(keys);
      setStats(keyStats);
      setCreatedKey(createdApiKey.key);
      setShowCreateModal(false);
      setShowKeyModal(true);
      setNewKey({
        name: '',
        permissions: ['read'],
        environment: 'development',
        rate_limit: 1000,
        ip_whitelist: [],
        description: ''
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      if (error.message?.includes('API client is not properly initialized') || 
          error.message?.includes('Cannot read properties of undefined')) {
        alert('API client is not properly initialized. Please refresh the page and try again.');
      }
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiKeyService.revokeApiKey(keyId);
      
      // Refresh data to get updated stats
      const [keys, keyStats] = await Promise.all([
        apiKeyService.getApiKeys(),
        apiKeyService.getApiKeyStats()
      ]);
      
      setApiKeys(keys);
      setStats(keyStats);
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  const handleViewActivity = async (key: ApiKey) => {
    try {
      setSelectedKey(key);
      setShowActivityModal(true);
      
      const keyActivities = await apiKeyService.getKeyActivities(key.id);
      setActivities(keyActivities);
    } catch (error) {
      console.error('Error loading activity data:', error);
      setActivities([]);
    }
  };

  const handleRegenerateKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to regenerate this API key? This will create a new key and revoke the old one.')) {
      return;
    }
    
    try {
      const regeneratedKey = await apiKeyService.regenerateApiKey(keyId);
      
      // Refresh data to get updated stats
      const [keys, keyStats] = await Promise.all([
        apiKeyService.getApiKeys(),
        apiKeyService.getApiKeyStats()
      ]);
      
      setApiKeys(keys);
      setStats(keyStats);
      setCreatedKey(regeneratedKey.key);
      setShowKeyModal(true);
    } catch (error) {
      console.error('Error regenerating API key:', error);
    }
  };

  const getFilteredKeys = () => {
    return apiKeys.filter(key => {
      const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           key.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           key.key.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && key.is_active) ||
                           (filterStatus === 'revoked' && !key.is_active);
      
      const matchesEnvironment = filterEnvironment === 'all' || key.environment === filterEnvironment;
      
      return matchesSearch && matchesStatus && matchesEnvironment;
    });
  };

  const getUsagePercentage = (key: ApiKey) => {
    return Math.min((key.monthly_usage / key.rate_limit) * 100, 100);
  };

  const formatApiKey = (key: string) => {
    if (key.length <= 12) return key;
    const firstPart = key.substring(0, 6);
    const lastPart = key.substring(key.length - 4);
    return `${firstPart}...${lastPart}`;
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying key:', error);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const permissionColors = {
    read: 'bg-green-100 text-green-800',
    write: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    admin: 'bg-purple-100 text-purple-800'
  };

  const environmentColors = {
    development: 'bg-yellow-100 text-yellow-800',
    production: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-8">Please sign in to access your API keys.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-2 text-gray-600">
            Manage your API keys for programmatic access to the RAI Platform.
          </p>
        </div>

        {/* Analytics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Keys</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total_keys}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Keys</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.active_keys}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total API Calls</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.total_usage.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Usage</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.monthly_usage.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search keys by name, description, or key..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="revoked">Revoked</option>
              </select>
              
              <select
                value={filterEnvironment}
                onChange={(e) => setFilterEnvironment(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Environments</option>
                <option value="development">Development</option>
                <option value="production">Production</option>
              </select>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create New Key</span>
              </button>
            </div>
          </div>
        </div>

        {/* API Keys List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {getFilteredKeys().length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys Found</h3>
                <p className="text-gray-600 mb-4">No keys match your current filters.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterEnvironment('all');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {getFilteredKeys().map((apiKey) => (
                  <div key={apiKey.id} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Key Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                apiKey.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {apiKey.is_active ? 'Active' : 'Revoked'}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${environmentColors[apiKey.environment]}`}>
                                {apiKey.environment}
                              </span>
                            </div>
                            
                            {apiKey.description && (
                              <p className="text-sm text-gray-600 mb-3">{apiKey.description}</p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              {apiKey.permissions.map((permission) => (
                                <span
                                  key={permission}
                                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${permissionColors[permission as keyof typeof permissionColors] || 'bg-gray-100 text-gray-800'}`}
                                >
                                  {permission}
                                </span>
                              ))}
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center space-x-4">
                                <span>Created: {formatDate(apiKey.created_at)}</span>
                                {apiKey.last_used && (
                                  <span>Last used: {formatDate(apiKey.last_used)}</span>
                                )}
                                {apiKey.expires_at && (
                                  <span>Expires: {formatDate(apiKey.expires_at)}</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-4">
                                <span>Total calls: {apiKey.usage_count.toLocaleString()}</span>
                                <span>Monthly: {apiKey.monthly_usage.toLocaleString()}/{apiKey.rate_limit.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <span className="text-gray-500">API Key:</span>
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{formatApiKey(apiKey.key)}</span>
                              </div>
                            </div>
                            
                            {/* Usage Progress Bar */}
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Monthly Usage</span>
                                <span>{getUsagePercentage(apiKey).toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getUsagePercentage(apiKey) > 80 ? 'bg-red-600' : getUsagePercentage(apiKey) > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                  style={{ width: `${getUsagePercentage(apiKey)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex lg:flex-col items-start lg:items-end justify-start lg:justify-center space-y-2 lg:space-y-2 space-x-2 lg:space-x-0">
                        <button
                          onClick={() => handleCopyKey(apiKey.key)}
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-50 transition-colors"
                          title="Copy Full API Key"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleViewActivity(apiKey)}
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-50 transition-colors"
                          title="View Activity"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </button>
                        
                        {apiKey.is_active && (
                          <>
                            <button
                              onClick={() => handleRegenerateKey(apiKey.id)}
                              className="text-yellow-400 hover:text-yellow-600 p-2 rounded-md hover:bg-yellow-50 transition-colors"
                              title="Regenerate Key"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={() => handleRevokeKey(apiKey.id)}
                              className="text-red-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
                              title="Revoke API Key"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Key Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Create New API Key</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateKey} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Name *
                    </label>
                    <input
                      type="text"
                      value={newKey.name}
                      onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Development Key, Production Key"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Environment *
                    </label>
                    <select
                      value={newKey.environment}
                      onChange={(e) => setNewKey({ ...newKey, environment: e.target.value as 'development' | 'production' })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="development">Development</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newKey.description}
                    onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the purpose of this API key..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate Limit (requests/month)
                    </label>
                    <input
                      type="number"
                      value={newKey.rate_limit}
                      onChange={(e) => setNewKey({ ...newKey, rate_limit: parseInt(e.target.value) })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="100000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Date (optional)
                    </label>
                    <input
                      type="date"
                      value={newKey.expires_at}
                      onChange={(e) => setNewKey({ ...newKey, expires_at: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Whitelist (comma-separated, optional)
                  </label>
                  <input
                    type="text"
                    value={newKey.ip_whitelist.join(', ')}
                    onChange={(e) => setNewKey({ 
                      ...newKey, 
                      ip_whitelist: e.target.value.split(',').map(ip => ip.trim()).filter(ip => ip)
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="192.168.1.100, 10.0.0.50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['read', 'write', 'delete', 'admin'].map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newKey.permissions.includes(permission)}
                          onChange={(e) => {
                            const permissions = e.target.checked
                              ? [...newKey.permissions, permission]
                              : newKey.permissions.filter(p => p !== permission);
                            setNewKey({ ...newKey, permissions });
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Key
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Show Key Modal */}
        {showKeyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Your New API Key</h2>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Copy this API key and store it securely. You won't be able to see it again.
                </p>
                <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
                  {createdKey}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleCopyKey(createdKey)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{copied ? 'Copied!' : 'Copy Key'}</span>
                </button>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activity Modal */}
        {showActivityModal && selectedKey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Activity Log - {selectedKey.name}</h2>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Environment:</span>
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-2 ${environmentColors[selectedKey.environment]}`}>
                      {selectedKey.environment}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ml-2 ${
                      selectedKey.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedKey.is_active ? 'Active' : 'Revoked'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">API Key:</span>
                    <span className="ml-2 font-mono text-xs bg-gray-200 px-2 py-1 rounded">{formatApiKey(selectedKey.key)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Calls:</span>
                    <span className="ml-2 font-medium">{selectedKey.usage_count.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Monthly Usage:</span>
                    <span className="ml-2 font-medium">{selectedKey.monthly_usage.toLocaleString()}/{selectedKey.rate_limit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No activity found for this API key.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusColors[activity.status]}`}>
                                {activity.status}
                              </span>
                              <span className="text-sm font-medium text-gray-900 capitalize">
                                {activity.action}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">IP Address:</span>
                                <span className="ml-2 font-mono">{activity.ip_address}</span>
                              </div>
                              <div>
                                <span className="font-medium">User Agent:</span>
                                <span className="ml-2 truncate">{activity.user_agent}</span>
                              </div>
                              {activity.endpoint && (
                                <div>
                                  <span className="font-medium">Endpoint:</span>
                                  <span className="ml-2 font-mono">{activity.endpoint}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}