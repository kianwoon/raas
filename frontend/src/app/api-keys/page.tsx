'use client';

import { useState, useEffect } from 'react';
import { isAuthenticated } from '@/lib/auth';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used: string | null;
  expires_at: string | null;
  permissions: string[];
  is_active: boolean;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState<{ name: string; permissions: string[] }>({
    name: '',
    permissions: ['read']
  });
  const [createdKey, setCreatedKey] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Mock API keys data - in a real app, this would come from an API
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockKeys: ApiKey[] = [
          {
            id: '1',
            name: 'Development Key',
            key: 'sk_dev_1234567890abcdef',
            created_at: '2024-01-15T10:30:00Z',
            last_used: '2024-01-20T14:45:00Z',
            expires_at: null,
            permissions: ['read', 'write'],
            is_active: true
          },
          {
            id: '2',
            name: 'Testing Key',
            key: 'sk_test_0987654321fedcba',
            created_at: '2024-01-10T08:15:00Z',
            last_used: null,
            expires_at: '2024-12-31T23:59:59Z',
            permissions: ['read'],
            is_active: true
          }
        ];
        
        setApiKeys(mockKeys);
      } catch (error) {
        console.error('Error loading API keys:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApiKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a random API key
      const key = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const newApiKey: ApiKey = {
        id: Date.now().toString(),
        name: newKey.name,
        key: key,
        created_at: new Date().toISOString(),
        last_used: null,
        expires_at: null,
        permissions: newKey.permissions,
        is_active: true
      };
      
      setApiKeys([...apiKeys, newApiKey]);
      setCreatedKey(key);
      setShowCreateModal(false);
      setShowKeyModal(true);
      setNewKey({ name: '', permissions: ['read'] });
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, is_active: false } : key
      ));
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
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

  const formatDate = (dateString: string) => {
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

  if (!isAuthenticated()) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-2 text-gray-600">
            Manage your API keys for programmatic access to the RAI Platform.
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create New API Key</span>
          </button>
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
            {apiKeys.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys</h3>
                <p className="text-gray-600 mb-4">Create your first API key to start using the platform programmatically.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create API Key
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            apiKey.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {apiKey.is_active ? 'Active' : 'Revoked'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          <span>Created: {formatDate(apiKey.created_at)}</span>
                          {apiKey.last_used && (
                            <span>Last used: {formatDate(apiKey.last_used)}</span>
                          )}
                          {apiKey.expires_at && (
                            <span>Expires: {formatDate(apiKey.expires_at)}</span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center space-x-2">
                          {apiKey.permissions.map((permission) => (
                            <span
                              key={permission}
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${permissionColors[permission as keyof typeof permissionColors] || 'bg-gray-100 text-gray-800'}`}
                            >
                              {permission}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopyKey(apiKey.key)}
                          className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-50"
                          title="Copy API Key"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        {apiKey.is_active && (
                          <button
                            onClick={() => handleRevokeKey(apiKey.id)}
                            className="text-red-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50"
                            title="Revoke API Key"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
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
              
              <form onSubmit={handleCreateKey}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Name
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
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-2">
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
                
                <div className="flex justify-end space-x-3">
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
      </div>
    </div>
  );
}