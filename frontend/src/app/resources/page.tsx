'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const resources = [
    // Documentation
    {
      id: 'getting-started',
      title: 'Getting Started Guide',
      description: 'Complete walkthrough for new users to set up their first AI model assessment',
      category: 'documentation',
      type: 'guide',
      difficulty: 'beginner',
      readingTime: '15 min',
      lastUpdated: '2024-03-15',
      downloads: 2450,
      rating: 4.8,
      tags: ['onboarding', 'setup', 'basics'],
      featured: true,
      content: 'step-by-step guide covering account creation, first model upload, and basic assessment configuration'
    },
    {
      id: 'api-documentation',
      title: 'API Documentation',
      description: 'Complete API reference for integrating the Singapore RAI Platform with your systems',
      category: 'documentation',
      type: 'reference',
      difficulty: 'intermediate',
      readingTime: '30 min',
      lastUpdated: '2024-03-20',
      downloads: 1890,
      rating: 4.9,
      tags: ['api', 'integration', 'developers'],
      featured: true,
      content: 'comprehensive API documentation with examples, authentication, and webhook configurations'
    },
    {
      id: 'framework-integration',
      title: 'Framework Integration Guide',
      description: 'How to integrate multiple compliance frameworks into your AI development workflow',
      category: 'documentation',
      type: 'guide',
      difficulty: 'advanced',
      readingTime: '45 min',
      lastUpdated: '2024-03-10',
      downloads: 1200,
      rating: 4.7,
      tags: ['frameworks', 'compliance', 'integration'],
      featured: false,
      content: 'detailed guide on implementing multiple compliance frameworks simultaneously'
    },

    // Tutorials
    {
      id: 'first-model-card',
      title: 'Creating Your First Model Card',
      description: 'Hands-on tutorial for creating comprehensive model documentation',
      category: 'tutorials',
      type: 'video',
      difficulty: 'beginner',
      duration: '25 min',
      lastUpdated: '2024-03-18',
      views: 3200,
      rating: 4.9,
      tags: ['model-cards', 'documentation', 'tutorial'],
      featured: true,
      content: 'video walkthrough creating a complete model card with all required fields'
    },
    {
      id: 'fairness-metrics',
      title: 'Implementing Fairness Metrics',
      description: 'Learn how to measure and improve fairness in your AI models',
      category: 'tutorials',
      type: 'interactive',
      difficulty: 'intermediate',
      duration: '40 min',
      lastUpdated: '2024-03-12',
      views: 2100,
      rating: 4.8,
      tags: ['fairness', 'metrics', 'bias'],
      featured: false,
      content: 'interactive tutorial on implementing various fairness metrics and interpreting results'
    },
    {
      id: 'compliance-automation',
      title: 'Automating Compliance Checks',
      description: 'Set up automated compliance monitoring for your AI systems',
      category: 'tutorials',
      type: 'video',
      difficulty: 'advanced',
      duration: '35 min',
      lastUpdated: '2024-03-08',
      views: 1800,
      rating: 4.6,
      tags: ['automation', 'compliance', 'monitoring'],
      featured: false,
      content: 'video tutorial on setting up automated compliance workflows and alerts'
    },

    // Tools & Templates
    {
      id: 'risk-assessment-template',
      title: 'AI Risk Assessment Template',
      description: 'Comprehensive template for conducting AI risk assessments',
      category: 'tools',
      type: 'template',
      difficulty: 'intermediate',
      downloadCount: 890,
      lastUpdated: '2024-03-05',
      rating: 4.7,
      tags: ['risk', 'assessment', 'template'],
      featured: true,
      content: 'downloadable risk assessment template with scoring methodology'
    },
    {
      id: 'compliance-checklist',
      title: 'Compliance Checklist Generator',
      description: 'Generate custom compliance checklists based on selected frameworks',
      category: 'tools',
      type: 'interactive',
      difficulty: 'beginner',
      lastUpdated: '2024-03-15',
      uses: 5600,
      rating: 4.8,
      tags: ['compliance', 'checklist', 'generator'],
      featured: true,
      content: 'interactive tool to generate customized compliance checklists'
    },
    {
      id: 'model-card-template',
      title: 'Model Card Template Library',
      description: 'Pre-built templates for different types of AI models',
      category: 'tools',
      type: 'template',
      difficulty: 'beginner',
      downloadCount: 1200,
      lastUpdated: '2024-03-01',
      rating: 4.6,
      tags: ['templates', 'model-cards', 'examples'],
      featured: false,
      content: 'collection of model card templates for various AI applications'
    },

    // Research Papers
    {
      id: 'fairness-survey',
      title: 'Survey of AI Fairness Metrics',
      description: 'Comprehensive survey of fairness metrics and their applications in different domains',
      category: 'research',
      type: 'paper',
      difficulty: 'advanced',
      readingTime: '60 min',
      published: '2024-02-15',
      citations: 45,
      rating: 4.9,
      tags: ['fairness', 'research', 'survey'],
      featured: true,
      content: 'academic survey paper covering various fairness metrics and their theoretical foundations'
    },
    {
      id: 'transparency-frameworks',
      title: 'Comparative Analysis of Transparency Frameworks',
      description: 'Detailed comparison of major AI transparency frameworks and their effectiveness',
      category: 'research',
      type: 'paper',
      difficulty: 'advanced',
      readingTime: '45 min',
      published: '2024-01-20',
      citations: 32,
      rating: 4.7,
      tags: ['transparency', 'frameworks', 'comparison'],
      featured: false,
      content: 'research paper comparing different approaches to AI transparency'
    },

    // Case Studies
    {
      id: 'banking-fairness',
      title: 'Fairness in Banking AI Systems',
      description: 'How a major bank implemented fairness metrics in their credit scoring AI',
      category: 'case-studies',
      type: 'case-study',
      difficulty: 'intermediate',
      readingTime: '25 min',
      published: '2024-02-28',
      industry: 'Finance',
      rating: 4.8,
      tags: ['banking', 'fairness', 'case-study'],
      featured: true,
      content: 'detailed case study of fairness implementation in financial services AI'
    },
    {
      id: 'healthcare-transparency',
      title: 'Transparency in Healthcare AI',
      description: 'Implementing transparent AI systems for diagnostic recommendations',
      category: 'case-studies',
      type: 'case-study',
      difficulty: 'intermediate',
      readingTime: '30 min',
      published: '2024-02-10',
      industry: 'Healthcare',
      rating: 4.9,
      tags: ['healthcare', 'transparency', 'diagnostics'],
      featured: false,
      content: 'case study on transparency implementation in medical AI systems'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Resources', count: resources.length },
    { id: 'documentation', name: 'Documentation', count: resources.filter(r => r.category === 'documentation').length },
    { id: 'tutorials', name: 'Tutorials', count: resources.filter(r => r.category === 'tutorials').length },
    { id: 'tools', name: 'Tools & Templates', count: resources.filter(r => r.category === 'tools').length },
    { id: 'research', name: 'Research', count: resources.filter(r => r.category === 'research').length },
    { id: 'case-studies', name: 'Case Studies', count: resources.filter(r => r.category === 'case-studies').length }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documentation': return '📚';
      case 'tutorials': return '🎥';
      case 'tools': return '🛠️';
      case 'research': return '🔬';
      case 'case-studies': return '📊';
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
      case 'guide': return '📖';
      case 'video': return '🎬';
      case 'interactive': return '🖱️';
      case 'template': return '📋';
      case 'paper': return '📄';
      case 'case-study': return '🏢';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Resources & Learning Center
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Everything you need to master responsible AI development, from beginner guides to advanced research
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/model-cards" className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
                Start Learning
              </Link>
              <Link href="/contact" className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
                Get Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Learning Resources</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">15K+</div>
              <div className="text-gray-600">Active Learners</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">4.8★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Access Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {resources.filter(r => r.featured).slice(0, 3).map((resource) => (
              <div key={resource.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
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
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search resources by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      {resource.readingTime && (
                        <span>📖 {resource.readingTime}</span>
                      )}
                      {resource.duration && (
                        <span>⏱️ {resource.duration}</span>
                      )}
                      {resource.downloadCount && (
                        <span>⬇️ {resource.downloadCount.toLocaleString()}</span>
                      )}
                      {resource.views && (
                        <span>👁️ {resource.views.toLocaleString()}</span>
                      )}
                      {resource.uses && (
                        <span>🛠️ {resource.uses.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span>⭐ {resource.rating}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                      {resource.type === 'video' ? 'Watch Now' : 
                       resource.type === 'interactive' ? 'Try Now' :
                       resource.type === 'template' ? 'Download' :
                       resource.type === 'paper' ? 'Read Paper' :
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600">Try adjusting your search terms or category filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Learning Paths</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  🌱
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-center">Beginner Path</h3>
                <p className="text-gray-700 text-sm mb-4">Perfect for those new to responsible AI and model cards</p>
                <ul className="text-sm text-gray-600 mb-4">
                  <li>• Getting Started Guide</li>
                  <li>• First Model Card Tutorial</li>
                  <li>• Basic Fairness Concepts</li>
                </ul>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                  Start Path
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl">
                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  🚀
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-center">Advanced Path</h3>
                <p className="text-gray-700 text-sm mb-4">For experienced practitioners looking to deepen their expertise</p>
                <ul className="text-sm text-gray-600 mb-4">
                  <li>• Framework Integration</li>
                  <li>• Advanced Fairness Metrics</li>
                  <li>• Compliance Automation</li>
                </ul>
                <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                  Start Path
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  🏢
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-center">Industry Path</h3>
                <p className="text-gray-700 text-sm mb-4">Specialized content for specific industries and use cases</p>
                <ul className="text-sm text-gray-600 mb-4">
                  <li>• Banking & Finance</li>
                  <li>• Healthcare AI</li>
                  <li>• Government Applications</li>
                </ul>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                  Start Path
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest resources, tutorials, and industry insights on responsible AI
          </p>
          <form className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-white placeholder-gray-300 caret-white"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-r-lg transition duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}