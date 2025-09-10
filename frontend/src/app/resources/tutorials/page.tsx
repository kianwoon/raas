'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Tutorials', count: 18 },
    { id: 'model-cards', name: 'Model Cards', count: 6 },
    { id: 'fairness', name: 'Fairness', count: 4 },
    { id: 'transparency', name: 'Transparency', count: 3 },
    { id: 'implementation', name: 'Implementation', count: 5 },
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];

  const tutorials = [
    {
      id: 1,
      title: 'Create Your First Model Card',
      description: 'Step-by-step tutorial on creating your first model card with the Singapore RAI Platform.',
      category: 'model-cards',
      level: 'beginner',
      duration: '25 min',
      steps: 8,
      interactive: true,
      tags: ['model-cards', 'getting-started', 'tutorial'],
      featured: true,
    },
    {
      id: 2,
      title: 'Model Card Template Customization',
      description: 'Learn how to customize model card templates to match your organization\'s requirements.',
      category: 'model-cards',
      level: 'intermediate',
      duration: '40 min',
      steps: 12,
      interactive: true,
      tags: ['templates', 'customization', 'advanced'],
    },
    {
      id: 3,
      title: 'Batch Processing Model Cards',
      description: 'Tutorial on creating and managing multiple model cards efficiently.',
      category: 'model-cards',
      level: 'advanced',
      duration: '35 min',
      steps: 10,
      interactive: false,
      tags: ['batch', 'automation', 'efficiency'],
    },
    {
      id: 4,
      title: 'Model Card Version Control',
      description: 'Learn to track changes and maintain version history for your model cards.',
      category: 'model-cards',
      level: 'intermediate',
      duration: '30 min',
      steps: 9,
      interactive: true,
      tags: ['version-control', 'tracking', 'history'],
    },
    {
      id: 5,
      title: 'Exporting Model Cards',
      description: 'Learn to export model cards in various formats (PDF, JSON, HTML).',
      category: 'model-cards',
      level: 'beginner',
      duration: '20 min',
      steps: 6,
      interactive: true,
      tags: ['export', 'formats', 'sharing'],
    },
    {
      id: 6,
      title: 'Model Card Validation',
      description: 'Ensure your model cards meet compliance standards through validation.',
      category: 'model-cards',
      level: 'intermediate',
      duration: '28 min',
      steps: 8,
      interactive: true,
      tags: ['validation', 'compliance', 'quality'],
    },
    {
      id: 7,
      title: 'Fairness Metrics 101',
      description: 'Introduction to fairness metrics and how to calculate them.',
      category: 'fairness',
      level: 'beginner',
      duration: '22 min',
      steps: 7,
      interactive: true,
      tags: ['fairness', 'metrics', 'introduction'],
      featured: true,
    },
    {
      id: 8,
      title: 'Bias Detection Techniques',
      description: 'Hands-on tutorial for detecting bias in machine learning models.',
      category: 'fairness',
      level: 'intermediate',
      duration: '45 min',
      steps: 11,
      interactive: true,
      tags: ['bias', 'detection', 'techniques'],
    },
    {
      id: 9,
      title: 'Fairness Visualization',
      description: 'Learn to create visualizations to communicate fairness metrics effectively.',
      category: 'fairness',
      level: 'advanced',
      duration: '38 min',
      steps: 9,
      interactive: true,
      tags: ['visualization', 'communication', 'metrics'],
    },
    {
      id: 10,
      title: 'Mitigating Algorithmic Bias',
      description: 'Practical techniques for identifying and mitigating bias in AI systems.',
      category: 'fairness',
      level: 'advanced',
      duration: '50 min',
      steps: 13,
      interactive: true,
      tags: ['mitigation', 'bias', 'algorithms'],
    },
    {
      id: 11,
      title: 'Explainable AI Fundamentals',
      description: 'Understanding the basics of explainable AI and interpretability.',
      category: 'transparency',
      level: 'beginner',
      duration: '30 min',
      steps: 8,
      interactive: true,
      tags: ['explainability', 'interpretability', 'basics'],
    },
    {
      id: 12,
      title: 'SHAP Values Explained',
      description: 'Deep dive into SHAP values and how to use them for model explanation.',
      category: 'transparency',
      level: 'advanced',
      duration: '42 min',
      steps: 10,
      interactive: true,
      tags: ['shap', 'explanation', 'advanced'],
    },
    {
      id: 13,
      title: 'Creating Transparency Reports',
      description: 'Learn to create comprehensive transparency reports for AI systems.',
      category: 'transparency',
      level: 'intermediate',
      duration: '35 min',
      steps: 9,
      interactive: true,
      tags: ['reports', 'transparency', 'documentation'],
    },
    {
      id: 14,
      title: 'API Integration Tutorial',
      description: 'Integrate model cards with external systems using our REST API.',
      category: 'implementation',
      level: 'intermediate',
      duration: '32 min',
      steps: 8,
      interactive: true,
      tags: ['api', 'integration', 'rest'],
    },
    {
      id: 15,
      title: 'CI/CD for Model Cards',
      description: 'Set up automated model card generation in your CI/CD pipeline.',
      category: 'implementation',
      level: 'advanced',
      duration: '40 min',
      steps: 11,
      interactive: false,
      tags: ['cicd', 'automation', 'deployment'],
    },
    {
      id: 16,
      title: 'Database Integration',
      description: 'Connect model cards with your existing database systems.',
      category: 'implementation',
      level: 'intermediate',
      duration: '28 min',
      steps: 7,
      interactive: true,
      tags: ['database', 'integration', 'storage'],
    },
    {
      id: 17,
      title: 'Custom Dashboard Creation',
      description: 'Build custom dashboards to monitor AI model performance and fairness.',
      category: 'implementation',
      level: 'advanced',
      duration: '45 min',
      steps: 12,
      interactive: true,
      tags: ['dashboard', 'monitoring', 'customization'],
    },
    {
      id: 18,
      title: 'Security Best Practices',
      description: 'Implement security measures to protect your model cards and data.',
      category: 'implementation',
      level: 'intermediate',
      duration: '25 min',
      steps: 6,
      interactive: true,
      tags: ['security', 'protection', 'best-practices'],
    },
  ];

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || tutorial.level === selectedLevel;
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesLevel && matchesSearch;
  });

  const featuredTutorials = tutorials.filter(tutorial => tutorial.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Interactive Tutorials</h1>
            <p className="text-xl text-purple-100 mb-8">
              Hands-on tutorials to master AI transparency, fairness, and model card creation
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-purple-500 px-3 py-1 rounded-full">18 Tutorials</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-purple-500 px-3 py-1 rounded-full">Interactive</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-purple-500 px-3 py-1 rounded-full">Step-by-Step</span>
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
                  placeholder="Search tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedLevel === level.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tutorials */}
      {searchQuery === '' && selectedCategory === 'all' && selectedLevel === 'all' && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Tutorials</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredTutorials.map((tutorial) => (
                  <div key={tutorial.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Featured
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                          tutorial.level === 'beginner' ? 'bg-green-100 text-green-800' :
                          tutorial.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {tutorial.level}
                        </span>
                        {tutorial.interactive && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Interactive
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{tutorial.title}</h3>
                      <p className="text-gray-600 mb-4">{tutorial.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <span>{tutorial.duration}</span>
                          <span>{tutorial.steps} steps</span>
                        </div>
                        <div className="flex gap-2">
                          {tutorial.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                        Start Tutorial
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Tutorials */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'All Tutorials' : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <span className="text-gray-600">
                {filteredTutorials.length} tutorial{filteredTutorials.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {filteredTutorials.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tutorials found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutorials.map((tutorial) => (
                  <div key={tutorial.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                          tutorial.level === 'beginner' ? 'bg-green-100 text-green-800' :
                          tutorial.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {tutorial.level}
                        </span>
                        {tutorial.interactive && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Interactive
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{tutorial.title}</h3>
                      <p className="text-gray-600 mb-4">{tutorial.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <span>{tutorial.duration}</span>
                          <span>{tutorial.steps} steps</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tutorial.tags.map((tag) => (
                          <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                        Start Tutorial
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Learning Progress Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Track Your Progress</h2>
            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 font-bold text-2xl">0</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed</h3>
                  <p className="text-gray-600">Tutorials finished</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-yellow-600 font-bold text-2xl">0</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">In Progress</h3>
                  <p className="text-gray-600">Currently learning</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold text-2xl">0</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificates</h3>
                  <p className="text-gray-600">Earned certificates</p>
                </div>
              </div>
              <div className="text-center mt-8">
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300">
                  Sign In to Track Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tutorial Format Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What to Expect</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Step-by-Step</h3>
                <p className="text-gray-600">Clear, guided instructions for each tutorial</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive</h3>
                <p className="text-gray-600">Hands-on exercises and real-time feedback</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Code Examples</h3>
                <p className="text-gray-600">Ready-to-use code samples and templates</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold text-xl">4</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quizzes</h3>
                <p className="text-gray-600">Test your knowledge with interactive quizzes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-xl text-purple-100 mb-8">
              Choose a tutorial that matches your skill level and start building your AI transparency expertise
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/resources"
                className="bg-white text-purple-600 hover:bg-purple-50 font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                Browse All Resources
              </Link>
              <button className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 font-bold py-3 px-8 rounded-lg transition duration-300">
                Get Learning Path
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}