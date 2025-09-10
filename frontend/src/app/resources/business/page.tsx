'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BusinessResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const businessResources = [
    // Strategy & Planning
    {
      id: 'ai-strategy-guide',
      title: 'AI Strategy Development Guide',
      description: 'Comprehensive guide for developing enterprise AI strategies with responsible AI principles',
      category: 'strategy',
      type: 'guide',
      difficulty: 'intermediate',
      readingTime: '35 min',
      lastUpdated: '2024-03-20',
      downloads: 2800,
      rating: 4.9,
      tags: ['strategy', 'planning', 'enterprise', 'leadership'],
      featured: true,
      content: 'step-by-step guide for developing responsible AI strategies'
    },
    {
      id: 'roi-calculator',
      title: 'AI ROI Calculator',
      description: 'Calculate the return on investment for AI transparency and governance initiatives',
      category: 'strategy',
      type: 'tool',
      difficulty: 'beginner',
      lastUpdated: '2024-03-18',
      downloads: 4200,
      rating: 4.8,
      tags: ['roi', 'calculator', 'investment', 'business-case'],
      featured: true,
      content: 'interactive ROI calculator for AI governance investments'
    },
    {
      id: 'vendor-evaluation',
      title: 'AI Vendor Evaluation Framework',
      description: 'Framework for evaluating and selecting AI vendors and solutions',
      category: 'strategy',
      type: 'framework',
      difficulty: 'intermediate',
      readingTime: '25 min',
      lastUpdated: '2024-03-15',
      downloads: 1900,
      rating: 4.7,
      tags: ['vendor', 'evaluation', 'procurement', 'selection'],
      featured: false,
      content: 'comprehensive vendor evaluation framework for AI solutions'
    },

    // Compliance & Risk
    {
      id: 'compliance-checklist',
      title: 'Regulatory Compliance Checklist',
      description: 'Complete checklist for ensuring compliance with AI regulations and standards',
      category: 'compliance',
      type: 'checklist',
      difficulty: 'intermediate',
      lastUpdated: '2024-03-17',
      downloads: 3500,
      rating: 4.9,
      tags: ['compliance', 'regulations', 'checklist', 'standards'],
      featured: true,
      content: 'comprehensive compliance checklist for AI regulations'
    },
    {
      id: 'risk-assessment',
      title: 'AI Risk Assessment Methodology',
      description: 'Structured approach to identifying and mitigating AI-related risks',
      category: 'compliance',
      type: 'methodology',
      difficulty: 'advanced',
      readingTime: '40 min',
      lastUpdated: '2024-03-12',
      downloads: 2100,
      rating: 4.8,
      tags: ['risk', 'assessment', 'mitigation', 'framework'],
      featured: false,
      content: 'structured risk assessment methodology for AI systems'
    },
    {
      id: 'audit-preparation',
      title: 'AI Audit Preparation Guide',
      description: 'Prepare your organization for AI audits and regulatory reviews',
      category: 'compliance',
      type: 'guide',
      difficulty: 'advanced',
      readingTime: '30 min',
      lastUpdated: '2024-03-10',
      downloads: 1600,
      rating: 4.7,
      tags: ['audit', 'preparation', 'review', 'compliance'],
      featured: false,
      content: 'comprehensive guide for AI audit preparation'
    },

    // Implementation
    {
      id: 'implementation-roadmap',
      title: 'Implementation Roadmap Template',
      description: 'Customizable roadmap for implementing AI governance in your organization',
      category: 'implementation',
      type: 'template',
      difficulty: 'intermediate',
      lastUpdated: '2024-03-16',
      downloads: 3200,
      rating: 4.8,
      tags: ['implementation', 'roadmap', 'template', 'planning'],
      featured: true,
      content: 'customizable implementation roadmap template'
    },
    {
      id: 'stakeholder-management',
      title: 'Stakeholder Management Guide',
      description: 'Effectively manage stakeholders during AI transformation initiatives',
      category: 'implementation',
      type: 'guide',
      difficulty: 'intermediate',
      readingTime: '20 min',
      lastUpdated: '2024-03-14',
      downloads: 1800,
      rating: 4.6,
      tags: ['stakeholders', 'management', 'communication', 'change'],
      featured: false,
      content: 'stakeholder management guide for AI initiatives'
    },
    {
      id: 'change-management',
      title: 'Change Management Toolkit',
      description: 'Tools and templates for managing organizational change during AI adoption',
      category: 'implementation',
      type: 'toolkit',
      difficulty: 'advanced',
      lastUpdated: '2024-03-11',
      downloads: 2400,
      rating: 4.7,
      tags: ['change-management', 'organizational', 'adoption', 'transformation'],
      featured: false,
      content: 'comprehensive change management toolkit for AI adoption'
    },

    // Training & Development
    {
      id: 'executive-training',
      title: 'Executive Training Program',
      description: 'Training materials for executives on responsible AI leadership',
      category: 'training',
      type: 'training',
      difficulty: 'beginner',
      duration: '2 hours',
      lastUpdated: '2024-03-19',
      views: 1500,
      rating: 4.9,
      tags: ['executive', 'leadership', 'training', 'awareness'],
      featured: true,
      content: 'executive training program for responsible AI leadership'
    },
    {
      id: 'team-certification',
      title: 'Team Certification Path',
      description: 'Certification path for building internal AI governance capabilities',
      category: 'training',
      type: 'certification',
      difficulty: 'intermediate',
      readingTime: '15 min',
      lastUpdated: '2024-03-13',
      downloads: 2800,
      rating: 4.8,
      tags: ['certification', 'training', 'capability', 'skills'],
      featured: false,
      content: 'team certification path for AI governance capabilities'
    },

    // Case Studies
    {
      id: 'banking-transformation',
      title: 'Banking AI Transformation Case Study',
      description: 'How a leading bank implemented AI governance across their organization',
      category: 'case-studies',
      type: 'case-study',
      difficulty: 'intermediate',
      readingTime: '25 min',
      published: '2024-03-08',
      industry: 'Banking',
      rating: 4.9,
      tags: ['banking', 'transformation', 'governance', 'case-study'],
      featured: true,
      content: 'detailed case study of banking AI transformation'
    },
    {
      id: 'healthcare-compliance',
      title: 'Healthcare Compliance Implementation',
      description: 'Implementing AI compliance in healthcare systems and workflows',
      category: 'case-studies',
      type: 'case-study',
      difficulty: 'advanced',
      readingTime: '30 min',
      published: '2024-03-05',
      industry: 'Healthcare',
      rating: 4.8,
      tags: ['healthcare', 'compliance', 'implementation', 'case-study'],
      featured: false,
      content: 'healthcare AI compliance implementation case study'
    },

    // Templates & Tools
    {
      id: 'policy-template',
      title: 'AI Policy Template',
      description: 'Comprehensive template for developing organizational AI policies',
      category: 'templates',
      type: 'template',
      difficulty: 'intermediate',
      lastUpdated: '2024-03-15',
      downloads: 5100,
      rating: 4.9,
      tags: ['policy', 'template', 'governance', 'documentation'],
      featured: true,
      content: 'comprehensive AI policy template for organizations'
    },
    {
      id: 'governance-framework',
      title: 'Governance Framework Template',
      description: 'Customizable framework for establishing AI governance structures',
      category: 'templates',
      type: 'framework',
      difficulty: 'advanced',
      lastUpdated: '2024-03-09',
      downloads: 2900,
      rating: 4.8,
      tags: ['governance', 'framework', 'structure', 'template'],
      featured: false,
      content: 'customizable AI governance framework template'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Resources', count: businessResources.length },
    { id: 'strategy', name: 'Strategy & Planning', count: businessResources.filter(r => r.category === 'strategy').length },
    { id: 'compliance', name: 'Compliance & Risk', count: businessResources.filter(r => r.category === 'compliance').length },
    { id: 'implementation', name: 'Implementation', count: businessResources.filter(r => r.category === 'implementation').length },
    { id: 'training', name: 'Training', count: businessResources.filter(r => r.category === 'training').length },
    { id: 'case-studies', name: 'Case Studies', count: businessResources.filter(r => r.category === 'case-studies').length },
    { id: 'templates', name: 'Templates', count: businessResources.filter(r => r.category === 'templates').length }
  ];

  const filteredResources = businessResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strategy': return '🎯';
      case 'compliance': return '📋';
      case 'implementation': return '🚀';
      case 'training': return '🎓';
      case 'case-studies': return '🏢';
      case 'templates': return '📄';
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
      case 'tool': return '🔧';
      case 'framework': return '🏗️';
      case 'checklist': return '✅';
      case 'methodology': return '📊';
      case 'template': return '📋';
      case 'training': return '🎓';
      case 'certification': return '🏆';
      case 'case-study': return '🏢';
      case 'toolkit': return '🛠️';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Business Resources
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Strategic resources for implementing responsible AI governance and driving business value
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/resources" className="bg-white text-green-600 hover:bg-green-50 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
                All Resources
              </Link>
              <a href="#business-value" className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
                Business Value
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Business Value Cards */}
      <section id="business-value" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Responsible AI Matters for Business</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                🛡️
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-center">Risk Mitigation</h3>
              <p className="text-gray-700 text-sm mb-4">Reduce regulatory, legal, and reputational risks through proper AI governance</p>
              <div className="text-center">
                <span className="text-2xl font-bold text-green-600">87%</span>
                <p className="text-xs text-gray-600">risk reduction</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                📈
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-center">Business Growth</h3>
              <p className="text-gray-700 text-sm mb-4">Drive innovation and gain competitive advantage with responsible AI</p>
              <div className="text-center">
                <span className="text-2xl font-bold text-blue-600">3.2x</span>
                <p className="text-xs text-gray-600">ROI improvement</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                🤝
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-center">Trust Building</h3>
              <p className="text-gray-700 text-sm mb-4">Build customer trust and enhance brand reputation through transparency</p>
              <div className="text-center">
                <span className="text-2xl font-bold text-purple-600">92%</span>
                <p className="text-xs text-gray-600">customer trust</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Organizations Served</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">15</div>
              <div className="text-gray-600">Industries Covered</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">4.8★</div>
              <div className="text-gray-600">Business Rating</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Business Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {businessResources.filter(r => r.featured).slice(0, 3).map((resource) => (
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
                placeholder="Search business resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-green-600 text-white'
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
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
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
                      {resource.downloads && (
                        <span>⬇️ {resource.downloads.toLocaleString()}</span>
                      )}
                      {resource.views && (
                        <span>👁️ {resource.views.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span>⭐ {resource.rating}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                      {resource.type === 'tool' || resource.type === 'calculator' ? 'Use Tool' :
                       resource.type === 'template' || resource.type === 'framework' ? 'Download' :
                       resource.type === 'training' || resource.type === 'certification' ? 'Start Training' :
                       resource.type === 'case-study' ? 'Read Case Study' :
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No business resources found</h3>
              <p className="text-gray-600">Try adjusting your search terms or category filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Consulting Services */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Need Professional Guidance?</h2>
            <p className="text-xl text-gray-700 mb-8">
              Our team of experts can help you implement responsible AI practices tailored to your business needs
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  📋
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Assessment</h3>
                <p className="text-gray-600 text-sm mb-4">Comprehensive AI maturity assessment and gap analysis</p>
                <button className="text-green-600 hover:text-green-700 font-medium">
                  Learn More →
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  🎯
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Strategy</h3>
                <p className="text-gray-600 text-sm mb-4">Custom AI strategy and governance framework development</p>
                <button className="text-green-600 hover:text-green-700 font-medium">
                  Learn More →
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  🚀
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Implementation</h3>
                <p className="text-gray-600 text-sm mb-4">End-to-end implementation support and change management</p>
                <button className="text-green-600 hover:text-green-700 font-medium">
                  Learn More →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}