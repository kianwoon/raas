'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CaseStudiesPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedChallenge, setSelectedChallenge] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const industries = [
    { id: 'all', name: 'All Industries', count: 12 },
    { id: 'fintech', name: 'FinTech', count: 3 },
    { id: 'healthcare', name: 'Healthcare', count: 2 },
    { id: 'retail', name: 'Retail', count: 2 },
    { id: 'manufacturing', name: 'Manufacturing', count: 2 },
    { id: 'public-sector', name: 'Public Sector', count: 3 },
  ];

  const challenges = [
    { id: 'all', name: 'All Challenges' },
    { id: 'fairness', name: 'Fairness' },
    { id: 'transparency', name: 'Transparency' },
    { id: 'bias', name: 'Bias Mitigation' },
    { id: 'accountability', name: 'Accountability' },
  ];

  const caseStudies = [
    {
      id: 1,
      title: 'Google India: Safety Charter for AI-Led Transformation',
      description: 'Google\'s comprehensive approach to responsible AI development in India, focusing on safety, fairness, and inclusive digital transformation.',
      industry: 'fintech',
      challenge: 'fairness',
      company: 'Google India',
      location: 'India',
      year: '2024',
      duration: 'Ongoing',
      teamSize: '100+',
      featured: true,
      tags: ['safety-charter', 'responsible-ai', 'digital-transformation', 'inclusive-technology'],
      impact: {
        users: '700M+',
        safety: 'Comprehensive framework',
        inclusion: 'Pan-India reach',
        trust: 'Industry leadership'
      },
      overview: 'Google India introduced a comprehensive Safety Charter for AI-led transformation, establishing principles for responsible AI development that prioritizes safety, fairness, and inclusive growth across India\'s diverse digital ecosystem.',
      challenge: 'Ensuring AI development and deployment in India prioritizes safety, fairness, and inclusion while serving diverse linguistic, cultural, and socioeconomic needs across the country.',
      solution: 'Developed a multi-stakeholder Safety Charter with principles for responsible AI, including robust testing, bias mitigation, transparency, and inclusive design tailored for India\'s unique context.',
      results: 'Established industry-leading standards for responsible AI in India, fostering trust and ensuring AI benefits reach all segments of society.',
    },
    {
      id: 2,
      title: 'DBS Bank: AI Fairness in Loan Approval',
      description: 'DBS Bank implemented transparent AI systems for loan processing to reduce bias and improve financial inclusion.',
      industry: 'fintech',
      challenge: 'fairness',
      company: 'DBS Bank',
      location: 'Singapore',
      year: '2023',
      duration: '12 months',
      teamSize: '15+',
      tags: ['banking', 'loan-approval', 'fairness', 'financial-inclusion'],
      impact: {
        users: '2M+',
        approval: '25% increase',
        fairness: '45% improvement',
        inclusion: '30% increase'
      },
    },
    {
      id: 3,
      title: 'SingHealth: AI Transparency in Medical Diagnosis',
      description: 'Implementation of transparent AI systems for medical diagnosis with explainable decision-making processes.',
      industry: 'healthcare',
      challenge: 'transparency',
      company: 'SingHealth',
      location: 'Singapore',
      year: '2023',
      duration: '24 months',
      teamSize: '30+',
      featured: true,
      tags: ['healthcare', 'diagnosis', 'transparency', 'explainability'],
      impact: {
        patients: '1M+',
        accuracy: '15% improvement',
        trust: '50% increase',
        adoption: '40% increase'
      },
    },
    {
      id: 4,
      title: 'NTUC FairPrice: AI in Inventory Management',
      description: 'Fair AI systems for inventory management and demand forecasting across Singapore\'s largest grocery chain.',
      industry: 'retail',
      challenge: 'fairness',
      company: 'NTUC FairPrice',
      location: 'Singapore',
      year: '2023',
      duration: '8 months',
      teamSize: '12+',
      tags: ['retail', 'inventory', 'forecasting', 'supply-chain'],
      impact: {
        stores: '200+',
        waste: '20% reduction',
        availability: '18% improvement',
        efficiency: '25% increase'
      },
    },
    {
      id: 5,
      title: 'Singapore Airlines: Bias Mitigation in Customer Service AI',
      description: 'Implementation of bias detection and mitigation in AI-powered customer service systems.',
      industry: 'retail',
      challenge: 'bias',
      company: 'Singapore Airlines',
      location: 'Singapore',
      year: '2023',
      duration: '16 months',
      teamSize: '20+',
      tags: ['aviation', 'customer-service', 'bias-mitigation', 'nlp'],
      impact: {
        customers: '15M+',
        satisfaction: '35% increase',
        resolution: '40% improvement',
        fairness: '50% improvement'
      },
    },
    {
      id: 6,
      title: 'Singapore Land Authority: Transparent AI in Property Assessment',
      description: 'Transparent AI systems for property valuation and assessment with comprehensive audit trails.',
      industry: 'public-sector',
      challenge: 'transparency',
      company: 'Singapore Land Authority',
      location: 'Singapore',
      year: '2023',
      duration: '20 months',
      teamSize: '18+',
      tags: ['government', 'property', 'valuation', 'transparency'],
      impact: {
        properties: '1.5M+',
        accuracy: '22% improvement',
        trust: '45% increase',
        efficiency: '30% increase'
      },
    },
    {
      id: 7,
      title: 'Grab: AI Accountability in Ride-Hailing',
      description: 'Accountable AI systems for driver-partner matching and fare calculation with comprehensive oversight.',
      industry: 'public-sector',
      challenge: 'accountability',
      company: 'Grab',
      location: 'Southeast Asia',
      year: '2023',
      duration: '14 months',
      teamSize: '25+',
      featured: true,
      tags: ['ride-hailing', 'mobility', 'accountability', 'fairness'],
      impact: {
        users: '180M+',
        drivers: '5M+',
        fairness: '38% improvement',
        satisfaction: '32% increase'
      },
    },
    {
      id: 8,
      title: 'ST Engineering: AI Fairness in Defense Systems',
      description: 'Fair AI systems in defense technology with rigorous testing and validation protocols.',
      industry: 'manufacturing',
      challenge: 'fairness',
      company: 'ST Engineering',
      location: 'Singapore',
      year: '2023',
      duration: '22 months',
      teamSize: '35+',
      tags: ['defense', 'manufacturing', 'fairness', 'testing'],
      impact: {
        systems: '50+',
        accuracy: '18% improvement',
        reliability: '25% increase',
        compliance: '100% achieved'
      },
    },
    {
      id: 9,
      title: 'MOH: Bias Mitigation in Public Health AI',
      description: 'Bias detection and mitigation in AI systems for public health policy and resource allocation.',
      industry: 'public-sector',
      challenge: 'bias',
      company: 'Ministry of Health',
      location: 'Singapore',
      year: '2023',
      duration: '18 months',
      teamSize: '22+',
      tags: ['healthcare', 'public-health', 'bias-mitigation', 'policy'],
      impact: {
        population: '5.7M+',
        equity: '42% improvement',
        outcomes: '28% improvement',
        trust: '38% increase'
      },
    },
    {
      id: 10,
      title: 'Charter Keck Cramer: AI in Real Estate Valuation',
      description: 'Transparent AI systems for property valuation with comprehensive fairness metrics.',
      industry: 'manufacturing',
      challenge: 'transparency',
      company: 'Charter Keck Cramer',
      location: 'Australia',
      year: '2023',
      duration: '12 months',
      teamSize: '16+',
      tags: ['real-estate', 'valuation', 'transparency', 'fairness'],
      impact: {
        valuations: '100K+',
        accuracy: '20% improvement',
        bias: '35% reduction',
        trust: '40% increase'
      },
    },
    {
      id: 11,
      title: 'IBM Watson Health: Explainable AI in Drug Discovery',
      description: 'Explainable AI systems for drug discovery with comprehensive transparency measures.',
      industry: 'healthcare',
      challenge: 'transparency',
      company: 'IBM Watson Health',
      location: 'Global',
      year: '2023',
      duration: '24 months',
      teamSize: '40+',
      tags: ['pharmaceutical', 'drug-discovery', 'explainability', 'transparency'],
      impact: {
        projects: '200+',
        time: '30% reduction',
        accuracy: '25% improvement',
        cost: '22% reduction'
      },
    },
    {
      id: 12,
      title: 'Singtel: AI Fairness in Network Optimization',
      description: 'Fair AI systems for network resource allocation and optimization across diverse user groups.',
      industry: 'manufacturing',
      challenge: 'fairness',
      company: 'Singtel',
      location: 'Singapore',
      year: '2023',
      duration: '16 months',
      teamSize: '28+',
      tags: ['telecommunications', 'network', 'optimization', 'fairness'],
      impact: {
        users: '4M+',
        performance: '35% improvement',
        fairness: '40% improvement',
        satisfaction: '32% increase'
      },
    },
  ];

  const filteredCaseStudies = caseStudies.filter(study => {
    const matchesIndustry = selectedIndustry === 'all' || study.industry === selectedIndustry;
    const matchesChallenge = selectedChallenge === 'all' || study.challenge === selectedChallenge;
    const matchesSearch = study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         study.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         study.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesIndustry && matchesChallenge && matchesSearch;
  });

  const featuredCaseStudies = caseStudies.filter(study => study.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Case Studies</h1>
            <p className="text-xl text-teal-100 mb-8">
              Real-world implementations of responsible AI, fairness, and transparency across industries
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-teal-500 px-3 py-1 rounded-full">12 Case Studies</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-teal-500 px-3 py-1 rounded-full">6 Industries</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-teal-500 px-3 py-1 rounded-full">Real Results</span>
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
                  placeholder="Search case studies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {industries.map((industry) => (
                  <button
                    key={industry.id}
                    onClick={() => setSelectedIndustry(industry.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedIndustry === industry.id
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {industry.name} ({industry.count})
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {challenges.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => setSelectedChallenge(challenge.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedChallenge === challenge.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {challenge.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      {searchQuery === '' && selectedIndustry === 'all' && selectedChallenge === 'all' && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Case Studies</h2>
              <div className="space-y-8">
                {featuredCaseStudies.map((study) => (
                  <div key={study.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Featured
                            </span>
                            <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {study.industry}
                            </span>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {study.challenge}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{study.title}</h3>
                          <p className="text-gray-600 mb-4">{study.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Company:</span> {study.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Location:</span> {study.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Year:</span> {study.year}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {study.overview && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Overview</h4>
                          <p className="text-gray-600">{study.overview}</p>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Challenge</h4>
                          <p className="text-sm text-gray-600">{study.challenge}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Duration</h4>
                          <p className="text-sm text-gray-600">{study.duration}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Team Size</h4>
                          <p className="text-sm text-gray-600">{study.teamSize}</p>
                        </div>
                      </div>
                      
                      {study.impact && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Key Impact Metrics</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(study.impact).map(([key, value]) => (
                              <div key={key} className="bg-teal-50 p-3 rounded-lg text-center">
                                <div className="text-2xl font-bold text-teal-600">{value}</div>
                                <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {study.tags.map((tag) => (
                            <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300">
                          Read Full Case Study
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Case Studies */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedIndustry === 'all' ? 'All Case Studies' : industries.find(c => c.id === selectedIndustry)?.name}
              </h2>
              <span className="text-gray-600">
                {filteredCaseStudies.length} case stud{filteredCaseStudies.length !== 1 ? 'ies' : 'y'} found
              </span>
            </div>

            {filteredCaseStudies.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No case studies found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCaseStudies.map((study) => (
                  <div key={study.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {study.industry}
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {study.challenge}
                        </span>
                        {study.featured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{study.title}</h3>
                      <p className="text-gray-600 mb-4">{study.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span>{study.company}</span>
                        <span>{study.year}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {study.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                        View Case Study
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Industry Insights Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Industry Insights</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-teal-600 font-bold text-xl">F</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">FinTech</h3>
                <p className="text-gray-600 mb-4">Leading in fairness and transparency with 3 major case studies</p>
                <div className="text-sm text-gray-500">
                  <div>• 40% avg. fairness improvement</div>
                  <div>• 35M+ users impacted</div>
                  <div>• 25% efficiency gains</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-teal-600 font-bold text-xl">H</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Healthcare</h3>
                <p className="text-gray-600 mb-4">Pioneering transparency in medical AI with 2 case studies</p>
                <div className="text-sm text-gray-500">
                  <div>• 50% trust improvement</div>
                  <div>• 1M+ patients benefited</div>
                  <div>• 15% accuracy increase</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-teal-600 font-bold text-xl">P</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Public Sector</h3>
                <p className="text-gray-600 mb-4">Setting standards in accountable AI with 3 implementations</p>
                <div className="text-sm text-gray-500">
                  <div>• 42% equity improvement</div>
                  <div>• 5.7M+ citizens served</div>
                  <div>• 38% trust increase</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-teal-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Want to Share Your Story?</h2>
            <p className="text-xl text-teal-100 mb-8">
              Contribute your organization's responsible AI implementation journey to our growing collection
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="bg-white text-teal-600 hover:bg-teal-50 font-bold py-3 px-8 rounded-lg transition duration-300"
              >
                Submit Your Case Study
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