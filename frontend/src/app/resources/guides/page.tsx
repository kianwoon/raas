'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Guides', count: 15 },
    { id: 'getting-started', name: 'Getting Started', count: 4 },
    { id: 'implementation', name: 'Implementation', count: 5 },
    { id: 'best-practices', name: 'Best Practices', count: 3 },
    { id: 'advanced', name: 'Advanced Topics', count: 3 },
  ];

  const guides = [
    {
      id: 1,
      title: 'Getting Started with Model Cards',
      description: 'Learn the fundamentals of creating effective model cards for AI transparency and documentation.',
      category: 'getting-started',
      difficulty: 'Beginner',
      readTime: '10 min',
      tags: ['model-cards', 'documentation', 'transparency'],
      featured: true,
    },
    {
      id: 2,
      title: 'Understanding AI Transparency Frameworks',
      description: 'Comprehensive guide to major AI transparency frameworks and how to implement them.',
      category: 'getting-started',
      difficulty: 'Beginner',
      readTime: '15 min',
      tags: ['frameworks', 'transparency', 'compliance'],
    },
    {
      id: 3,
      title: 'Setting Up Your First Model Card',
      description: 'Step-by-step tutorial on creating your first model card using the Singapore RAI Platform.',
      category: 'getting-started',
      difficulty: 'Beginner',
      readTime: '20 min',
      tags: ['tutorial', 'model-cards', 'setup'],
    },
    {
      id: 4,
      title: 'Essential Metrics for AI Fairness',
      description: 'Learn about key fairness metrics and how to measure them in your AI systems.',
      category: 'getting-started',
      difficulty: 'Beginner',
      readTime: '12 min',
      tags: ['fairness', 'metrics', 'measurement'],
    },
    {
      id: 5,
      title: 'Implementing Bias Detection in ML Models',
      description: 'Practical guide to detecting and mitigating bias in machine learning models.',
      category: 'implementation',
      difficulty: 'Intermediate',
      readTime: '25 min',
      tags: ['bias', 'detection', 'implementation'],
      featured: true,
    },
    {
      id: 6,
      title: 'Creating Comprehensive Model Documentation',
      description: 'Best practices for documenting AI models throughout their lifecycle.',
      category: 'implementation',
      difficulty: 'Intermediate',
      readTime: '18 min',
      tags: ['documentation', 'lifecycle', 'best-practices'],
    },
    {
      id: 7,
      title: 'Integrating Model Cards with CI/CD Pipelines',
      description: 'Learn how to automate model card generation and updates in your deployment pipeline.',
      category: 'implementation',
      difficulty: 'Advanced',
      readTime: '30 min',
      tags: ['cicd', 'automation', 'deployment'],
    },
    {
      id: 8,
      title: 'API Integration for Model Cards',
      description: 'Guide to integrating model cards with external systems and APIs.',
      category: 'implementation',
      difficulty: 'Intermediate',
      readTime: '22 min',
      tags: ['api', 'integration', 'automation'],
    },
    {
      id: 9,
      title: 'Version Control for AI Models',
      description: 'Best practices for tracking and versioning AI models and their documentation.',
      category: 'implementation',
      difficulty: 'Intermediate',
      readTime: '15 min',
      tags: ['version-control', 'tracking', 'lifecycle'],
    },
    {
      id: 10,
      title: 'Data Governance for AI Systems',
      description: 'Essential practices for managing data in AI systems with transparency and accountability.',
      category: 'best-practices',
      difficulty: 'Intermediate',
      readTime: '20 min',
      tags: ['data-governance', 'accountability', 'transparency'],
      featured: true,
    },
    {
      id: 11,
      title: 'Ethical AI Development Guidelines',
      description: 'Comprehensive guidelines for developing AI systems ethically and responsibly.',
      category: 'best-practices',
      difficulty: 'Intermediate',
      readTime: '25 min',
      tags: ['ethics', 'responsibility', 'guidelines'],
    },
    {
      id: 12,
      title: 'Stakeholder Communication for AI Projects',
      description: 'How to effectively communicate AI model behavior and limitations to stakeholders.',
      category: 'best-practices',
      difficulty: 'Intermediate',
      readTime: '18 min',
      tags: ['communication', 'stakeholders', 'reporting'],
    },
    {
      id: 13,
      title: 'Advanced Fairness Metrics Analysis',
      description: 'Deep dive into advanced fairness metrics and statistical analysis techniques.',
      category: 'advanced',
      difficulty: 'Advanced',
      readTime: '35 min',
      tags: ['fairness', 'statistics', 'analysis'],
    },
    {
      id: 14,
      title: 'Model Interpretability Techniques',
      description: 'Advanced techniques for making AI models more interpretable and explainable.',
      category: 'advanced',
      difficulty: 'Advanced',
      readTime: '40 min',
      tags: ['interpretability', 'explainability', 'techniques'],
    },
    {
      id: 15,
      title: 'Custom Model Card Templates',
      description: 'Create custom model card templates tailored to your organization\'s specific needs.',
      category: 'advanced',
      difficulty: 'Advanced',
      readTime: '28 min',
      tags: ['templates', 'customization', 'advanced'],
    },
  ];

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredGuides = guides.filter(guide => guide.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Implementation Guides</h1>
            <p className="text-xl text-blue-100 mb-8">
              Comprehensive guides to help you implement AI transparency, fairness, and accountability in your organization
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 px-3 py-1 rounded-full">15 Guides</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 px-3 py-1 rounded-full">3 Difficulty Levels</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 px-3 py-1 rounded-full">5 Categories</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search guides..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      {searchQuery === '' && selectedCategory === 'all' && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Guides</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredGuides.map((guide) => (
                  <div key={guide.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Featured
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                          guide.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                          guide.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {guide.difficulty}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{guide.title}</h3>
                      <p className="text-gray-600 mb-4">{guide.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{guide.readTime} read</span>
                        <div className="flex gap-2">
                          {guide.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Guides */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'All Guides' : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <span className="text-gray-600">
                {filteredGuides.length} guide{filteredGuides.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {filteredGuides.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No guides found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuides.map((guide) => (
                  <div key={guide.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                          guide.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                          guide.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {guide.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">{guide.readTime}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{guide.title}</h3>
                      <p className="text-gray-600 mb-4">{guide.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {guide.tags.map((tag) => (
                          <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                        Read Guide
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Recommended Learning Paths</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-green-600 font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Beginner Path</h3>
                <p className="text-gray-600 mb-4">Start with the fundamentals of AI transparency and model cards</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Getting Started with Model Cards
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Understanding AI Transparency Frameworks
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Essential Metrics for AI Fairness
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-yellow-600 font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Implementation Path</h3>
                <p className="text-gray-600 mb-4">Learn to implement transparency practices in your projects</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Implementing Bias Detection
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Creating Comprehensive Documentation
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    API Integration for Model Cards
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-red-600 font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Path</h3>
                <p className="text-gray-600 mb-4">Master advanced transparency and fairness techniques</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Advanced Fairness Metrics Analysis
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Model Interpretability Techniques
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Custom Model Card Templates
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join our community or contact our support team for personalized assistance
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                Contact Support
              </Link>
              <Link
                href="/resources"
                className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                Browse All Resources
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}