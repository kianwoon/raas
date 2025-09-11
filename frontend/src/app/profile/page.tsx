'use client';

import { useState, useEffect } from 'react';
import { profileApi, UserStatistics, UserProfile } from '@/lib/api/profile';

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    company: '',
    role: '',
    location: '',
    website: '',
    twitter: '',
    linkedin: '',
    github: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Load user profile and statistics in parallel
        const [profileResponse, statsResponse] = await Promise.all([
          profileApi.getUserProfile(),
          profileApi.getUserStatistics()
        ]);
        
        setUser(profileResponse);
        setStatistics(statsResponse);
        
        // Set form data with profile information
        setFormData(prev => ({
          ...prev,
          name: profileResponse.name || '',
          email: profileResponse.email || '',
          bio: profileResponse.bio || '',
          company: profileResponse.company || '',
          role: profileResponse.role || '',
          location: profileResponse.location || '',
          website: profileResponse.website || '',
          twitter: profileResponse.twitter || '',
          linkedin: profileResponse.linkedin || '',
          github: profileResponse.github || '',
          avatar: profileResponse.avatar || ''
        }));
        
      } catch (error) {
        console.error('Error loading user data:', error);
        
        // Fallback to localStorage if API fails
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setFormData(prev => ({
              ...prev,
              name: parsedUser.name || parsedUser.full_name || '',
              email: parsedUser.email || '',
              bio: parsedUser.bio || '',
              company: parsedUser.organization || '',
              role: parsedUser.job_title || parsedUser.role || '',
              location: parsedUser.location || '',
              website: parsedUser.website || '',
              twitter: parsedUser.twitter || '',
              linkedin: parsedUser.linkedin || '',
              github: parsedUser.github || '',
              avatar: parsedUser.avatar || parsedUser.avatar_url || ''
            }));
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
        
        // Set fallback statistics if not available
        setStatistics({
          model_cards_created: 0,
          fairness_assessments_created: 0,
          diagnosis_assessments_created: 0,
          total_api_calls_this_month: 0,
          member_since: new Date().toISOString(),
          recent_activity: []
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare profile data for API
      const profileData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        company: formData.company,
        role: formData.role,
        location: formData.location,
        website: formData.website,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        github: formData.github
      };
      
      // Update profile via API (this now works with localStorage fallback)
      const updatedProfile = await profileApi.updateUserProfile(profileData);
      
      // Update local state
      setUser(updatedProfile);
      
      // Add profile update activity to recent activity
      if (statistics) {
        const newActivity = {
          id: `profile-update-${Date.now()}`,
          type: 'profile_update' as const,
          title: 'Updated profile information',
          description: 'Profile details were updated',
          timestamp: new Date().toISOString(),
          status: 'completed' as const
        };
        
        setStatistics(prev => ({
          ...prev!,
          recent_activity: [newActivity, ...(prev?.recent_activity || [])]
        }));
      }
      
      setIsEditing(false);
      
      // Dispatch event to update navigation
      window.dispatchEvent(new Event('authStateChange'));
      
    } catch (error) {
      console.error('Error updating profile:', error);
      // You could add error state and show a message to the user here
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        
        // Upload avatar via API
        const response = await profileApi.uploadAvatar(file);
        
        // Update form data with new avatar URL
        setFormData(prev => ({
          ...prev,
          avatar: response.avatar_url
        }));
        
        // Update user state
        if (user) {
          setUser({
            ...user,
            avatar: response.avatar_url
          });
        }
        
        // Update localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            localStorage.setItem('user', JSON.stringify({
              ...parsedUser,
              avatar: response.avatar_url
            }));
          } catch (error) {
            console.error('Error updating localStorage user data:', error);
          }
        }
        
      } catch (error) {
        console.error('Error uploading avatar:', error);
        // Fallback to local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const avatarUrl = e.target?.result as string;
          setFormData(prev => ({
            ...prev,
            avatar: avatarUrl
          }));
        };
        reader.readAsDataURL(file);
      } finally {
        setLoading(false);
      }
    }
  };

  // Generate stats based on real data
  const stats = [
    { 
      label: 'Model Cards Created', 
      value: (statistics?.model_cards_created && !isNaN(statistics.model_cards_created)) ? statistics.model_cards_created.toString() : '0', 
      icon: '📊' 
    },
    { 
      label: 'Fairness Assessments', 
      value: (statistics?.fairness_assessments_created && !isNaN(statistics.fairness_assessments_created)) ? statistics.fairness_assessments_created.toString() : '0', 
      icon: '⚖️' 
    },
    { 
      label: 'API Calls This Month', 
      value: (statistics?.total_api_calls_this_month && !isNaN(statistics.total_api_calls_this_month)) ? statistics.total_api_calls_this_month.toLocaleString() : '0', 
      icon: '🔌' 
    },
    { 
      label: 'Member Since', 
      value: statistics?.member_since ? new Date(statistics.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown', 
      icon: '📅' 
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-16 mb-6">
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg">
                  {formData.avatar ? (
                    <img 
                      src={formData.avatar} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user?.name || 'User Name'}
                    </h1>
                    <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed disabled:border-gray-200 text-gray-900 !important placeholder-gray-500" style={{ color: '#111827' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed disabled:border-gray-200 text-gray-900 !important placeholder-gray-500" style={{ color: '#111827' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Your company"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed disabled:border-gray-200 text-gray-900 !important placeholder-gray-500" style={{ color: '#111827' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Your role"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed disabled:border-gray-200 text-gray-900 !important placeholder-gray-500" style={{ color: '#111827' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Your location"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed disabled:border-gray-200 text-gray-900 !important placeholder-gray-500" style={{ color: '#111827' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed disabled:border-gray-200 text-gray-900 !important placeholder-gray-500" style={{ color: '#111827' }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed disabled:border-gray-200 text-gray-900 !important placeholder-gray-500" style={{ color: '#111827' }}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">@</span>
                      <input
                        type="text"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="username"
                        className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed disabled:border-gray-200 text-gray-900 !important placeholder-gray-500" style={{ color: '#111827' }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="username"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed disabled:border-gray-200 text-gray-900 !important placeholder-gray-500" style={{ color: '#111827' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub
                    </label>
                    <input
                      type="text"
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="username"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed disabled:border-gray-200 text-gray-900 !important placeholder-gray-500" style={{ color: '#111827' }}
                    />
                  </div>
                </div>
                
                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
              <div className="space-y-3">
                <a href="/billing" className="block text-blue-600 hover:text-blue-700 text-sm">
                  Billing & Subscription →
                </a>
                <a href="/api-keys" className="block text-blue-600 hover:text-blue-700 text-sm">
                  API Keys →
                </a>
                <a href="/security" className="block text-blue-600 hover:text-blue-700 text-sm">
                  Security Settings →
                </a>
                <a href="/notifications" className="block text-blue-600 hover:text-blue-700 text-sm">
                  Notification Preferences →
                </a>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {statistics && statistics.recent_activity && statistics.recent_activity.length > 0 ? (
                  statistics.recent_activity.map((activity, index) => (
                    <div key={activity.id || index} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'model_card' ? 'bg-blue-600' :
                        activity.type === 'fairness_assessment' ? 'bg-green-600' :
                        activity.type === 'diagnosis_assessment' ? 'bg-purple-600' :
                        'bg-gray-600'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Unknown time'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No recent activity</p>
                    <p className="text-gray-400 text-xs mt-1">Your activity will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}