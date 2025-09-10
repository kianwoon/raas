'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission');

  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "Lead AI Ethics Researcher",
      expertise: "Fairness in AI Systems, Algorithmic Bias",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face&q=80"
    },
    {
      name: "Marcus Wong",
      role: "Technical Director",
      expertise: "Machine Learning Engineering, System Architecture",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&q=80"
    },
    {
      name: "Dr. Priya Patel",
      role: "Policy & Compliance Lead",
      expertise: "AI Governance, Regulatory Frameworks",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face&q=80"
    },
    {
      name: "David Tan",
      role: "Data Science Lead",
      expertise: "Model Evaluation, Fairness Metrics",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face&q=80"
    }
  ];

  const timeline = [
    {
      year: "2023",
      title: "Platform Inception",
      description: "Singapore RAI Platform founded with mission to promote responsible AI development"
    },
    {
      year: "2024 Q1",
      title: "Beta Launch",
      description: "Initial release with core model card functionality and fairness assessment tools"
    },
    {
      year: "2024 Q2",
      title: "Industry Partnership",
      description: "Collaboration with leading financial institutions and healthcare providers"
    },
    {
      year: "2024 Q3",
      title: "Framework Integration",
      description: "Support for major AI governance frameworks including EU AI Act and PDPA"
    },
    {
      year: "2024 Q4",
      title: "Public Launch",
      description: "Full platform release with comprehensive transparency and compliance features"
    }
  ];

  const values = [
    {
      title: "Transparency",
      description: "Clear, understandable documentation of AI systems and their decision-making processes",
      icon: "🔍"
    },
    {
      title: "Fairness",
      description: "Ensuring AI systems treat all individuals and groups equitably",
      icon: "⚖️"
    },
    {
      title: "Accountability",
      description: "Clear responsibility for AI system outcomes and impacts",
      icon: "📋"
    },
    {
      title: "Innovation",
      description: "Advancing AI technology while maintaining ethical standards",
      icon: "💡"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Singapore RAI Platform
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Pioneering Responsible AI Development in Singapore and Beyond
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/model-cards" className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
                Explore Model Cards
              </Link>
              <Link href="/contact" className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {['mission', 'team', 'timeline', 'values'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-16">
        {/* Mission Section */}
        {activeTab === 'mission' && (
          <div className="max-w-4xl mx-auto animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-700 mb-6">
                  The Singapore RAI Platform is dedicated to advancing responsible AI development through transparency, fairness, and accountability. We provide organizations with the tools and frameworks needed to ensure their AI systems align with ethical standards and regulatory requirements.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  In an era where AI is transforming industries and touching millions of lives, we believe that responsible development isn't just an option—it's a necessity. Our platform empowers organizations to build trust with their stakeholders while maintaining innovation and competitiveness.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                  <p className="text-blue-900 font-medium">
                    "Making AI responsible by design, not by accident."
                  </p>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop&crop=center&q=80"
                  alt="Team collaboration on AI ethics"
                  className="rounded-xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -right-6 bg-yellow-400 text-gray-900 rounded-lg p-4 shadow-xl">
                  <div className="text-sm font-semibold">Founded</div>
                  <div className="text-2xl font-bold">2023</div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Comprehensive Assessment</h3>
                <p className="text-gray-600">Complete evaluation of AI models across multiple fairness and transparency dimensions</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="text-3xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Framework Integration</h3>
                <p className="text-gray-600">Support for major AI governance frameworks and regulatory standards</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="text-3xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Industry Collaboration</h3>
                <p className="text-gray-600">Partnership with leading organizations across finance, healthcare, and government</p>
              </div>
            </div>
          </div>
        )}

        {/* Team Section */}
        {activeTab === 'team' && (
          <div className="max-w-6xl mx-auto animate-fadeIn">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Meet the experts behind Singapore RAI Platform, combining deep technical knowledge with ethical AI expertise
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  <div className="aspect-square">
                    <img 
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                    <p className="text-sm text-gray-600">{member.expertise}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Advisors Section */}
            <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Advisory Board</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                    Prof.
                  </div>
                  <h4 className="font-semibold text-gray-900">Dr. Emily Koh</h4>
                  <p className="text-sm text-gray-600">AI Ethics Advisor, NUS</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                    IMDA
                  </div>
                  <h4 className="font-semibold text-gray-900">James Lim</h4>
                  <p className="text-sm text-gray-600">Policy Advisor, IMDA</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                    MAS
                  </div>
                  <h4 className="font-semibold text-gray-900">Angela Chan</h4>
                  <p className="text-sm text-gray-600">Regulatory Advisor, MAS</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Section */}
        {activeTab === 'timeline' && (
          <div className="max-w-4xl mx-auto animate-fadeIn">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
              <p className="text-lg text-gray-600">
                Key milestones in our mission to promote responsible AI development
              </p>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-blue-200 transform md:-translate-x-0.5"></div>
              
              {timeline.map((item, index) => (
                <div key={index} className={`relative mb-12 ${
                  index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                }`}>
                  <div className="flex items-center md:justify-center">
                    <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg transform md:-translate-x-2"></div>
                    <div className={`ml-12 md:ml-0 md:w-5/12 ${
                      index % 2 === 0 ? 'md:pr-8' : 'md:pl-8 md:ml-auto'
                    }`}>
                      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="text-blue-600 font-bold text-sm mb-2">{item.year}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Values Section */}
        {activeTab === 'values' && (
          <div className="max-w-6xl mx-auto animate-fadeIn">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The core principles that guide our approach to responsible AI development
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {values.map((value, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-lg text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>

            {/* Impact Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6 text-center">Our Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">150+</div>
                  <div className="text-blue-100">AI Models Assessed</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">25+</div>
                  <div className="text-blue-100">Partner Organizations</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">8</div>
                  <div className="text-blue-100">Frameworks Supported</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">94%</div>
                  <div className="text-blue-100">User Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Call to Action */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Us in Shaping Responsible AI</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Whether you're an organization looking to implement responsible AI practices or an expert passionate about AI ethics, we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
              Get in Touch
            </Link>
            <Link href="/model-cards" className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 font-bold py-3 px-6 rounded-lg text-center transition duration-300">
              Explore Platform
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}