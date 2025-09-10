'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DevelopersResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const developerResources = [
    // API & Integration
    {
      id: 'api-documentation',
      title: 'API Documentation',
      description: 'Complete RESTful API reference for integrating with the Singapore RAI Platform',
      category: 'api',
      type: 'reference',
      difficulty: 'intermediate',
      readingTime: '45 min',
      lastUpdated: '2024-03-20',
      downloads: 3200,
      rating: 4.9,
      tags: ['api', 'rest', 'integration', 'authentication'],
      featured: true,
      content: 'comprehensive API documentation with endpoints, authentication, and code examples'
    },
    {
      id: 'sdk-guide',
      title: 'SDK Integration Guide',
      description: 'Step-by-step guide to integrating our SDK into your applications',
      category: 'api',
      type: 'guide',
      difficulty: 'beginner',
      readingTime: '30 min',
      lastUpdated: '2024-03-18',
      downloads: 2100,
      rating: 4.8,
      tags: ['sdk', 'integration', 'javascript', 'python'],
      featured: true,
      content: 'detailed SDK integration guide for multiple programming languages'
    },
    {
      id: 'webhooks',
      title: 'Webhooks Integration',
      description: 'Set up real-time notifications and automated workflows',
      category: 'api',
      type: 'tutorial',
      difficulty: 'intermediate',
      readingTime: '25 min',
      lastUpdated: '2024-03-15',
      downloads: 1500,
      rating: 4.7,
      tags: ['webhooks', 'automation', 'real-time'],
      featured: false,
      content: 'configure webhooks for real-time updates and automated workflows'
    },

    // Development Tools
    {
      id: 'cli-tool',
      title: 'Command Line Interface',
      description: 'Powerful CLI tool for managing model cards and assessments from terminal',
      category: 'tools',
      type: 'tool',
      difficulty: 'intermediate',
      lastUpdated: '2024-03-12',
      downloads: 2800,
      rating: 4.8,
      tags: ['cli', 'automation', 'terminal', 'devops'],
      featured: true,
      content: 'comprehensive CLI tool for model card management and automation'
    },
    {
      id: 'vscode-extension',
      title: 'VS Code Extension',
      description: 'Enhanced development experience with our VS Code extension',
      category: 'tools',
      type: 'extension',
      difficulty: 'beginner',
      lastUpdated: '2024-03-10',
      downloads: 3500,
      rating: 4.9,
      tags: ['vscode', 'extension', 'ide', 'development'],
      featured: true,
      content: 'VS Code extension for enhanced model card development experience'
    },
    {
      id: 'docker-setup',
      title: 'Docker Development Setup',
      description: 'Containerized development environment for consistent workflows',
      category: 'tools',
      type: 'guide',
      difficulty: 'intermediate',
      readingTime: '20 min',
      lastUpdated: '2024-03-08',
      downloads: 1800,
      rating: 4.6,
      tags: ['docker', 'containers', 'development', 'devops'],
      featured: false,
      content: 'Docker setup for consistent development environments'
    },

    // Code Examples
    {
      id: 'python-examples',
      title: 'Python Code Examples',
      description: 'Comprehensive Python examples for model assessment and integration',
      category: 'examples',
      type: 'code',
      difficulty: 'intermediate',
      lastUpdated: '2024-03-16',
      downloads: 4200,
      rating: 4.9,
      tags: ['python', 'examples', 'machine-learning', 'ai'],
      featured: true,
      content: 'collection of Python examples for model assessment workflows'
    },
    {
      id: 'javascript-sdk',
      title: 'JavaScript SDK Examples',
      description: 'Frontend integration examples using our JavaScript SDK',
      category: 'examples',
      type: 'code',
      difficulty: 'beginner',
      lastUpdated: '2024-03-14',
      downloads: 3100,
      rating: 4.7,
      tags: ['javascript', 'frontend', 'sdk', 'examples'],
      featured: false,
      content: 'JavaScript SDK examples for frontend integration'
    },
    {
      id: 'notebook-templates',
      title: 'Jupyter Notebook Templates',
      description: 'Ready-to-use notebook templates for model analysis',
      category: 'examples',
      type: 'templates',
      difficulty: 'intermediate',
      lastUpdated: '2024-03-11',
      downloads: 2600,
      rating: 4.8,
      tags: ['jupyter', 'notebook', 'python', 'analysis'],
      featured: false,
      content: 'Jupyter notebook templates for model analysis workflows'
    },

    // Testing & QA
    {
      id: 'testing-guide',
      title: 'Testing & Quality Assurance',
      description: 'Best practices for testing AI models and model cards',
      category: 'testing',
      type: 'guide',
      difficulty: 'advanced',
      readingTime: '40 min',
      lastUpdated: '2024-03-09',
      downloads: 1400,
      rating: 4.7,
      tags: ['testing', 'qa', 'quality', 'assurance'],
      featured: false,
      content: 'comprehensive testing guide for AI models and model cards'
    },
    {
      id: 'ci-cd-pipeline',
      title: 'CI/CD Pipeline Integration',
      description: 'Automate model validation and deployment workflows',
      category: 'testing',
      type: 'tutorial',
      difficulty: 'advanced',
      readingTime: '35 min',
      lastUpdated: '2024-03-07',
      downloads: 1900,
      rating: 4.8,
      tags: ['ci-cd', 'automation', 'devops', 'testing'],
      featured: false,
      content: 'CI/CD pipeline setup for automated model validation'
    },

    // Security
    {
      id: 'security-best-practices',
      title: 'Security Best Practices',
      description: 'Implement robust security measures for AI model deployments',
      category: 'security',
      type: 'guide',
      difficulty: 'advanced',
      readingTime: '30 min',
      lastUpdated: '2024-03-13',
      downloads: 2200,
      rating: 4.9,
      tags: ['security', 'best-practices', 'deployment', 'protection'],
      featured: true,
      content: 'security best practices for AI model deployments and APIs'
    },
    {
      id: 'authentication-guide',
      title: 'Authentication & Authorization',
      description: 'Implement secure authentication for your applications',
      category: 'security',
      type: 'tutorial',
      difficulty: 'intermediate',
      readingTime: '25 min',
      lastUpdated: '2024-03-06',
      downloads: 1700,
      rating: 4.8,
      tags: ['authentication', 'authorization', 'security', 'oauth'],
      featured: false,
      content: 'authentication and authorization implementation guide'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Resources', count: developerResources.length },
    { id: 'api', name: 'API & Integration', count: developerResources.filter(r => r.category === 'api').length },
    { id: 'tools', name: 'Development Tools', count: developerResources.filter(r => r.category === 'tools').length },
    { id: 'examples', name: 'Code Examples', count: developerResources.filter(r => r.category === 'examples').length },
    { id: 'testing', name: 'Testing & QA', count: developerResources.filter(r => r.category === 'testing').length },
    { id: 'security', name: 'Security', count: developerResources.filter(r => r.category === 'security').length }
  ];

  const filteredResources = developerResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'api': return '🔌';
      case 'tools': return '🛠️';
      case 'examples': return '💻';
      case 'testing': return '🧪';
      case 'security': return '🔒';
      default: return '📄';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reference': return '📚';
      case 'guide': return '📖';
      case 'tutorial': return '🎥';
      case 'tool': return '🔧';
      case 'extension': return '🔌';
      case 'code': return '💻';
      case 'templates': return '📋';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Developer Resources
            </h1>
            <p className="text-xl text-purple-100 mb-8">
              Everything developers need to integrate, build, and deploy with the Singapore RAI Platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/resources" className="bg-white text-purple-600 hover:bg-purple-50 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
                All Resources
              </Link>
              <a href="#quick-start" className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
                Quick Start
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Cards */}
      <section id="quick-start" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Start for Developers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                🔑
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-center">Get API Key</h3>
              <p className="text-gray-700 text-sm mb-4">Obtain your API credentials and set up authentication</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                Get Started
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                📦
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-center">Install SDK</h3>
              <p className="text-gray-700 text-sm mb-4">Install our SDK for your preferred programming language</p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                View SDKs
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                🚀
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-center">First Integration</h3>
              <p className="text-gray-700 text-sm mb-4">Follow our step-by-step guide to integrate your first model</p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                Start Tutorial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">12+</div>
              <div className="text-gray-600">API Endpoints</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">5</div>
              <div className="text-gray-600">SDK Languages</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">4.9★</div>
              <div className="text-gray-600">Developer Rating</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">API Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Developer Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {developerResources.filter(r => r.featured).slice(0, 3).map((resource) => (
              <div key={resource.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">{getCategoryIcon(resource.category)}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{resource.title}</h3>
                      <p className="text-sm text-gray-500">{resource.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{resource.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(resource.difficulty)}`}>
                      {resource.difficulty}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>⭐ {resource.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search developer resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{getCategoryIcon(resource.category)}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{resource.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{getTypeIcon(resource.type)} {resource.type.replace('-', ' ')}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(resource.difficulty)}`}>
                            {resource.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    {resource.featured && (
                      <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 mb-4">{resource.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {resource.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      {resource.readingTime && (
                        <span>📖 {resource.readingTime}</span>
                      )}
                      {resource.downloads && (
                        <span>⬇️ {resource.downloads.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span>⭐ {resource.rating}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                      {resource.type === 'tool' ? 'Download' :
                       resource.type === 'extension' ? 'Install' :
                       resource.type === 'code' ? 'View Code' :
                       resource.type === 'templates' ? 'Get Templates' :
                       'View Resource'}
                    </button>
                    <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition duration-300">
                      💾 Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No developer resources found</h3>
              <p className="text-gray-600">Try adjusting your search terms or category filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Developer Community */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Join Our Developer Community</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  💬
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Discord Community</h3>
                <p className="text-gray-600 text-sm mb-4">Connect with other developers and get help</p>
                <button className="text-purple-600 hover:text-purple-700 font-medium">
                  Join Discord →
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  📝
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Developer Blog</h3>
                <p className="text-gray-600 text-sm mb-4">Latest tutorials, updates, and best practices</p>
                <button className="text-purple-600 hover:text-purple-700 font-medium">
                  Read Blog →
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  🤝
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Contribute</h3>
                <p className="text-gray-600 text-sm mb-4">Help improve our tools and documentation</p>
                <button className="text-purple-600 hover:text-purple-700 font-medium">
                  Contribute →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}