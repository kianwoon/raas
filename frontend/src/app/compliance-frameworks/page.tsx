'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ComplianceFrameworksPage() {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const frameworks = [
    {
      id: 'eu-ai-act',
      name: 'EU AI Act',
      category: 'regional',
      region: 'European Union',
      status: 'active',
      description: 'Comprehensive regulatory framework for AI systems in the EU, risk-based approach with strict requirements for high-risk applications.',
      year: 2024,
      riskLevels: ['Minimal Risk', 'Limited Risk', 'High Risk', 'Unacceptable Risk'],
      keyRequirements: [
        'Risk assessment and mitigation',
        'Data governance and training practices',
        'Technical documentation and record-keeping',
        'Transparency and provision of information to users',
        'Human oversight and robustness'
      ],
      complianceIndicators: [
        { name: 'Risk Classification', status: 'required' },
        { name: 'Data Governance', status: 'required' },
        { name: 'Technical Documentation', status: 'required' },
        { name: 'Human Oversight', status: 'required' },
        { name: 'Conformity Assessment', status: 'required' }
      ],
      applicableSectors: ['Healthcare', 'Finance', 'Transportation', 'Education', 'Critical Infrastructure'],
      lastUpdated: '2024-03-15',
      implementationProgress: 85
    },
    {
      id: 'pdpa',
      name: 'Personal Data Protection Act (PDPA)',
      category: 'national',
      region: 'Singapore',
      status: 'active',
      description: 'Singapore\'s primary data protection law governing the collection, use, and disclosure of personal data in AI systems.',
      year: 2020,
      riskLevels: ['Data Privacy Risk', 'Consent Management', 'Breach Notification'],
      keyRequirements: [
        'Consent management and data minimization',
        'Purpose limitation and use restriction',
        'Access and correction rights',
        'Data security and breach notification',
        'Transfer limitations and accountability'
      ],
      complianceIndicators: [
        { name: 'Consent Management', status: 'required' },
        { name: 'Data Protection', status: 'required' },
        { name: 'Breach Response', status: 'required' },
        { name: 'Access Rights', status: 'required' },
        { name: 'Accountability', status: 'required' }
      ],
      applicableSectors: ['Finance', 'Healthcare', 'Retail', 'Government', 'Technology'],
      lastUpdated: '2024-01-20',
      implementationProgress: 95
    },
    {
      id: 'feat',
      name: 'FEAT Framework',
      category: 'industry',
      region: 'Global',
      status: 'active',
      description: 'Fairness, Ethics, Accountability, and Transparency framework for AI system development and deployment.',
      year: 2023,
      riskLevels: ['Fairness Risk', 'Ethical Risk', 'Accountability Risk', 'Transparency Risk'],
      keyRequirements: [
        'Fairness assessment across demographic groups',
        'Ethical impact evaluation',
        'Clear accountability frameworks',
        'Transparent model documentation',
        'Stakeholder engagement and communication'
      ],
      complianceIndicators: [
        { name: 'Fairness Metrics', status: 'required' },
        { name: 'Ethical Assessment', status: 'required' },
        { name: 'Accountability Framework', status: 'required' },
        { name: 'Transparency Documentation', status: 'required' },
        { name: 'Stakeholder Engagement', status: 'recommended' }
      ],
      applicableSectors: ['All Sectors'],
      lastUpdated: '2024-02-10',
      implementationProgress: 90
    },
    {
      id: 'nai-ai',
      name: 'NIST AI Risk Management Framework',
      category: 'international',
      region: 'United States',
      status: 'active',
      description: 'Voluntary framework for managing AI risks through governance, mapping, measurement, and management functions.',
      year: 2023,
      riskLevels: ['Operational Risk', 'Strategic Risk', 'Compliance Risk', 'Reputational Risk'],
      keyRequirements: [
        'Govern structures and processes',
        'Risk mapping and categorization',
        'Risk measurement and monitoring',
        'Risk management and mitigation',
        'Continuous improvement and adaptation'
      ],
      complianceIndicators: [
        { name: 'Risk Governance', status: 'required' },
        { name: 'Risk Mapping', status: 'required' },
        { name: 'Risk Measurement', status: 'required' },
        { name: 'Risk Management', status: 'required' },
        { name: 'Continuous Monitoring', status: 'recommended' }
      ],
      applicableSectors: ['All Sectors'],
      lastUpdated: '2024-01-15',
      implementationProgress: 88
    },
    {
      id: 'iso-42001',
      name: 'ISO/IEC 42001',
      category: 'international',
      region: 'Global',
      status: 'draft',
      description: 'International standard for Artificial Intelligence Management Systems (AIMS), providing requirements for establishing, implementing, and maintaining AI management systems.',
      year: 2023,
      riskLevels: ['Management System Risk', 'AI System Risk', 'Organizational Risk'],
      keyRequirements: [
        'AI management system establishment',
        'Leadership commitment and policy development',
        'Risk assessment and treatment',
        'Resource management and competence',
        'Performance evaluation and improvement'
      ],
      complianceIndicators: [
        { name: 'Management System', status: 'required' },
        { name: 'Leadership Commitment', status: 'required' },
        { name: 'Risk Assessment', status: 'required' },
        { name: 'Resource Management', status: 'required' },
        { name: 'Performance Evaluation', status: 'required' }
      ],
      applicableSectors: ['All Sectors'],
      lastUpdated: '2024-02-28',
      implementationProgress: 75
    },
    {
      id: 'hkma-ai',
      name: 'HKMA AI Principles',
      category: 'national',
      region: 'Hong Kong',
      status: 'active',
      description: 'Hong Kong Monetary Authority\'s high-level principles for promoting ethical AI adoption in the financial sector.',
      year: 2023,
      riskLevels: ['Governance Risk', 'Model Risk', 'Data Risk', 'Consumer Protection Risk'],
      keyRequirements: [
        'Governance and oversight frameworks',
        'Model risk management and validation',
        'Data quality and management',
        'Consumer protection and fairness',
        'Transparency and explainability'
      ],
      complianceIndicators: [
        { name: 'Governance Framework', status: 'required' },
        { name: 'Model Risk Management', status: 'required' },
        { name: 'Data Quality', status: 'required' },
        { name: 'Consumer Protection', status: 'required' },
        { name: 'Transparency', status: 'required' }
      ],
      applicableSectors: ['Finance', 'Banking', 'Insurance'],
      lastUpdated: '2023-11-30',
      implementationProgress: 82
    }
  ];

  const categories = [
    { id: 'all', name: 'All Frameworks', count: frameworks.length },
    { id: 'international', name: 'International', count: frameworks.filter(f => f.category === 'international').length },
    { id: 'regional', name: 'Regional', count: frameworks.filter(f => f.category === 'regional').length },
    { id: 'national', name: 'National', count: frameworks.filter(f => f.category === 'national').length },
    { id: 'industry', name: 'Industry', count: frameworks.filter(f => f.category === 'industry').length }
  ];

  const filteredFrameworks = frameworks.filter(framework => {
    const matchesSearch = framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         framework.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         framework.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || framework.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'draft': return '📝';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'required': return 'bg-red-100 text-red-800';
      case 'recommended': return 'bg-blue-100 text-blue-800';
      case 'optional': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Compliance Frameworks
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Comprehensive support for major AI governance frameworks and regulatory standards
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/model-cards" className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
                Assess Your Models
              </Link>
              <Link href="/contact" className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
                Get Expert Help
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Framework Overview */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">6+</div>
              <div className="text-gray-600">Frameworks Supported</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Coverage</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Compliance Monitoring</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-gray-600">Implementation Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search frameworks by name, description, or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Frameworks Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredFrameworks.map((framework) => (
              <div key={framework.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{framework.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(framework.status)}`}>
                          {getStatusIcon(framework.status)} {framework.status.charAt(0).toUpperCase() + framework.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">{framework.region}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{framework.year}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Implementation</div>
                      <div className="text-2xl font-bold text-blue-600">{framework.implementationProgress}%</div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6">{framework.description}</p>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Key Risk Levels:</h4>
                    <div className="flex flex-wrap gap-2">
                      {framework.riskLevels.map((risk, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {risk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Applicable Sectors:</h4>
                    <div className="flex flex-wrap gap-2">
                      {framework.applicableSectors.map((sector, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Compliance Indicators:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {framework.complianceIndicators.map((indicator, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{indicator.name}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getComplianceStatusColor(indicator.status)}`}>
                            {indicator.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setSelectedFramework(selectedFramework === framework.id ? null : framework.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {selectedFramework === framework.id ? 'Show Less' : 'View Details'}
                    </button>
                    <span className="text-sm text-gray-500">
                      Last updated: {new Date(framework.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>

                  {selectedFramework === framework.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200 animate-fadeIn">
                      <h4 className="font-semibold text-gray-900 mb-3">Key Requirements:</h4>
                      <ul className="space-y-2 mb-4">
                        {framework.keyRequirements.map((requirement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span className="text-gray-700">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="flex gap-3">
                        <Link
                          href={`/model-cards?framework=${framework.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                        >
                          Assess Against Framework
                        </Link>
                        <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-300">
                          Download Documentation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredFrameworks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No frameworks found</h3>
              <p className="text-gray-600">Try adjusting your search terms or category filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Implementation Guide */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Framework Implementation Guide</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Assessment</h3>
                <p className="text-gray-600">Evaluate your AI models against selected frameworks to identify compliance gaps</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Implementation</h3>
                <p className="text-gray-600">Follow our guided implementation process to meet framework requirements</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Monitoring</h3>
                <p className="text-gray-600">Continuous monitoring and reporting to maintain compliance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ensure Compliance?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Let our experts help you navigate the complex landscape of AI governance frameworks and ensure your models meet all regulatory requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/model-cards" className="bg-blue-600 hover:bg-blue-700 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
              Start Assessment
            </Link>
            <Link href="/contact" className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
              Contact Experts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}