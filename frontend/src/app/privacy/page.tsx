'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', name: 'Overview', icon: '📋' },
    { id: 'data-collection', name: 'Data Collection', icon: '📊' },
    { id: 'data-use', name: 'Data Use', icon: '🎯' },
    { id: 'data-sharing', name: 'Data Sharing', icon: '🤝' },
    { id: 'data-security', name: 'Data Security', icon: '🔒' },
    { id: 'user-rights', name: 'User Rights', icon: '👤' },
    { id: 'cookies', name: 'Cookies', icon: '🍪' },
    { id: 'children', name: 'Children\'s Privacy', icon: '👶' },
    { id: 'international', name: 'International Users', icon: '🌍' },
    { id: 'changes', name: 'Changes to Policy', icon: '📝' },
    { id: 'contact', name: 'Contact Us', icon: '📧' },
  ];

  const lastUpdated = 'November 2024';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-blue-100 mb-8">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 px-3 py-1 rounded-full">Last Updated: {lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 px-3 py-1 rounded-full">GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-500 px-3 py-1 rounded-full">PDPA Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <nav className="flex overflow-x-auto py-4 space-x-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Overview</h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold text-blue-900 mb-4">At a Glance</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">What We Collect</h4>
                        <ul className="space-y-1 text-blue-700">
                          <li>• Account information</li>
                          <li>• Model card data</li>
                          <li>• Usage analytics</li>
                          <li>• Technical information</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-2">How We Use It</h4>
                        <ul className="space-y-1 text-blue-700">
                          <li>• Provide our services</li>
                          <li>• Improve platform features</li>
                          <li>• Ensure security</li>
                          <li>• Communicate with you</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Privacy Commitment</h3>
                  <p className="text-gray-600 mb-4">
                    The Singapore RAI Platform is committed to protecting your privacy and ensuring the security of your personal information. 
                    This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our platform.
                  </p>
                  <p className="text-gray-600 mb-4">
                    By using our platform, you agree to the collection and use of information in accordance with this policy. 
                    We are committed to complying with the Personal Data Protection Act (PDPA) 2012 of Singapore and the General Data Protection Regulation (GDPR) where applicable.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🔒</div>
                      <h4 className="font-semibold text-gray-900">Secure</h4>
                      <p className="text-sm text-gray-600">Industry-standard encryption</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">👁️</div>
                      <h4 className="font-semibold text-gray-900">Transparent</h4>
                      <p className="text-sm text-gray-600">Clear data usage policies</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">⚖️</div>
                      <h4 className="font-semibold text-gray-900">Compliant</h4>
                      <p className="text-sm text-gray-600">GDPR and PDPA compliant</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Collection Section */}
            {activeSection === 'data-collection' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Collection</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Name and email address</strong> - For account creation and communication</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Organization and job title</strong> - To understand your professional context</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Contact information</strong> - For support and service updates</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Professional profile</strong> - To enhance platform experience</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Model Card Data</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Model information</strong> - Name, version, description, and purpose</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Performance metrics</strong> - Accuracy, fairness, and transparency measures</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Training data details</strong> - Data sources, demographics, and preprocessing</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Evaluation results</strong> - Testing outcomes and validation reports</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Usage Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Platform activity</strong> - Pages visited, features used, and time spent</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Model card interactions</strong> - Creation, editing, and viewing activities</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Search queries</strong> - Terms searched within the platform</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Export activities</strong> - Downloads and sharing of model cards</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Technical Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>IP address</strong> - For security and geographic analysis</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Browser information</strong> - Type, version, and language</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Device information</strong> - Hardware and operating system details</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Access times</strong> - When and how often you use the platform</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-yellow-900 mb-3">Collection Methods</h4>
                  <ul className="space-y-2 text-yellow-800">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span><strong>Direct collection</strong> - Information you provide when creating accounts or model cards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span><strong>Automated collection</strong> - Through cookies, analytics, and server logs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span><strong>Third-party collection</strong> - From integration partners and service providers</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Data Use Section */}
            {activeSection === 'data-use' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Use</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Service Provision</h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                          <li>• Create and manage your account</li>
                          <li>• Provide model card services</li>
                          <li>• Process your requests</li>
                          <li>• Enable platform features</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Platform Improvement</h4>
                        <ul className="space-y-1 text-sm text-green-800">
                          <li>• Analyze usage patterns</li>
                          <li>• Improve user experience</li>
                          <li>• Develop new features</li>
                          <li>• Optimize performance</li>
                        </ul>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Communication</h4>
                        <ul className="space-y-1 text-sm text-purple-800">
                          <li>• Send service updates</li>
                          <li>• Provide support</li>
                          <li>• Share important notices</li>
                          <li>• Respond to inquiries</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2">Security & Safety</h4>
                        <ul className="space-y-1 text-sm text-red-800">
                          <li>• Prevent fraud</li>
                          <li>• Protect against abuse</li>
                          <li>• Maintain platform integrity</li>
                          <li>• Ensure compliance</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2">Analytics & Research</h4>
                        <ul className="space-y-1 text-sm text-yellow-800">
                          <li>• Understand user behavior</li>
                          <li>• Measure platform effectiveness</li>
                          <li>• Conduct AI fairness research</li>
                          <li>• Generate anonymous insights</li>
                        </ul>
                      </div>
                      
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-900 mb-2">Legal Compliance</h4>
                        <ul className="space-y-1 text-sm text-indigo-800">
                          <li>• Meet regulatory requirements</li>
                          <li>• Respond to legal requests</li>
                          <li>• Protect our rights</li>
                          <li>• Maintain transparency</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-orange-900 mb-3">Data Processing Principles</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl mb-2">⚖️</div>
                      <h5 className="font-semibold text-orange-800">Lawful Basis</h5>
                      <p className="text-sm text-orange-700">We process data only with valid legal basis</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎯</div>
                      <h5 className="font-semibold text-orange-800">Purpose Limitation</h5>
                      <p className="text-sm text-orange-700">Data used only for specified purposes</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <h5 className="font-semibold text-orange-800">Data Minimization</h5>
                      <p className="text-sm text-orange-700">Only necessary data is collected</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Sharing Section */}
            {activeSection === 'data-sharing' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Sharing</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Who We Share Information With</h3>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Never Sold</h4>
                      <p className="text-gray-600">
                        We do not sell your personal information to third parties for marketing purposes.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Service Providers</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We share information with companies that perform services on our behalf:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Cloud Infrastructure</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Data hosting and storage</li>
                              <li>• Platform maintenance</li>
                              <li>• Security monitoring</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Support Services</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Customer support</li>
                              <li>• Email communication</li>
                              <li>• Analytics services</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Legal Requirements</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We may disclose information when required by law or to protect our rights:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Legal process</strong> - Court orders, subpoenas, or government requests</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Security concerns</strong> - To prevent fraud or protect platform security</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Rights protection</strong> - To defend our legal rights and property</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Safety emergencies</strong> - To protect against harm or illegal activity</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Business Transfers</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600">
                          In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction. 
                          We will notify you of any material change in ownership or use of your personal information.
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">With Your Consent</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600">
                          We may share your information with third parties when you give us explicit consent to do so, 
                          such as when you choose to share your model cards with specific organizations or individuals.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-green-900 mb-3">Data Sharing Safeguards</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-green-800 mb-2">Contractual Protection</h5>
                      <p className="text-sm text-green-700">
                        All third parties must sign agreements requiring them to protect your data and comply with privacy laws.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-green-800 mb-2">Limited Access</h5>
                      <p className="text-sm text-green-700">
                        Third parties only receive the minimum data necessary to perform their services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Security Section */}
            {activeSection === 'data-security' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Security</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Measures</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Technical Security</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-900 mb-2">Encryption</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• AES-256 encryption for data at rest</li>
                            <li>• TLS 1.3 for data in transit</li>
                            <li>• End-to-end encryption for sensitive data</li>
                            <li>• Regular encryption key rotation</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h5 className="font-semibold text-green-900 mb-2">Access Controls</h5>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Multi-factor authentication</li>
                            <li>• Role-based access control</li>
                            <li>• Least privilege principle</li>
                            <li>• Session timeout protection</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Infrastructure Security</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h5 className="font-semibold text-purple-900 mb-2">Network Security</h5>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Firewall protection</li>
                            <li>• Intrusion detection systems</li>
                            <li>• DDoS protection</li>
                            <li>• Network segmentation</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <h5 className="font-semibold text-yellow-900 mb-2">Physical Security</h5>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Secure data centers</li>
                            <li>• 24/7 surveillance</li>
                            <li>• Access control systems</li>
                            <li>• Environmental controls</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Operational Security</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Monitoring</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• 24/7 security monitoring</li>
                              <li>• Anomaly detection</li>
                              <li>• Activity logging</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Testing</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Regular security audits</li>
                              <li>• Penetration testing</li>
                              <li>• Vulnerability scanning</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Response</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Incident response plan</li>
                              <li>• Regular drills</li>
                              <li>• Breach notification</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-900 mb-3">Data Breach Notification</h4>
                  <p className="text-red-800 mb-4">
                    In the event of a data breach that affects your personal information, we will:
                  </p>
                  <ul className="space-y-2 text-red-800">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Notify you within 72 hours of becoming aware of the breach</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Provide details about what information was affected</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Explain the steps we're taking to address the breach</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Provide guidance on how you can protect yourself</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* User Rights Section */}
            {activeSection === 'user-rights' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">User Rights</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Data Rights</h3>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Access Rights</h4>
                        <p className="text-sm text-blue-800 mb-3">
                          You have the right to know what personal information we have about you.
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Request copy of your data</li>
                          <li>• Know how it's used</li>
                          <li>• Understand processing purposes</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-2">Correction Rights</h4>
                        <p className="text-sm text-green-800 mb-3">
                          You can request correction of inaccurate personal information.
                        </p>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Update incorrect information</li>
                          <li>• Complete incomplete data</li>
                          <li>• Add contextual information</li>
                        </ul>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">Deletion Rights</h4>
                        <p className="text-sm text-purple-800 mb-3">
                          You can request deletion of your personal information in certain circumstances.
                        </p>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• Account closure</li>
                          <li>• Withdraw consent</li>
                          <li>• Data no longer needed</li>
                        </ul>
                      </div>
                      
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-900 mb-2">Portability Rights</h4>
                        <p className="text-sm text-yellow-800 mb-3">
                          You can request your data in a machine-readable format.
                        </p>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          <li>• Export your data</li>
                          <li>• Transfer to another service</li>
                          <li>• Standard format delivery</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">How to Exercise Your Rights</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Account Portal</h5>
                            <p className="text-sm text-gray-600">
                              Many rights can be exercised directly through your account settings.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Email Request</h5>
                            <p className="text-sm text-gray-600">
                              Send your request to privacy@raipplatform.sg with your account details.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Verification</h5>
                            <p className="text-sm text-gray-600">
                              We may need to verify your identity before processing your request.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Response Time</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We will respond to your request within:
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-1">30 days</div>
                            <p className="text-sm text-gray-600">Standard requests</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-1">60 days</div>
                            <p className="text-sm text-gray-600">Complex requests</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-1">Extension</div>
                            <p className="text-sm text-gray-600">With justification</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-orange-900 mb-3">Limitations</h4>
                  <p className="text-orange-800">
                    Some rights may be limited by law or public interest. We will explain any limitations 
                    and provide reasons when we cannot fulfill your request.
                  </p>
                </div>
              </div>
            )}

            {/* Cookies Section */}
            {activeSection === 'cookies' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Cookies</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Cookie Policy</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">What Are Cookies?</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          Cookies are small text files placed on your device when you visit our website. 
                          They help us provide better services and improve your experience.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Types We Use</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Essential cookies</li>
                              <li>• Analytics cookies</li>
                              <li>• Functional cookies</li>
                              <li>• Targeting cookies</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Cookie Duration</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Session cookies (temporary)</li>
                              <li>• Persistent cookies (long-term)</li>
                              <li>• First-party cookies</li>
                              <li>• Third-party cookies</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Cookie Categories</h4>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-900 mb-2">Essential Cookies</h5>
                          <p className="text-sm text-blue-800 mb-2">Required for basic website functionality</p>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• User authentication</li>
                            <li>• Security verification</li>
                            <li>• Site navigation</li>
                          </ul>
                          <p className="text-xs text-blue-700 mt-2">Cannot be disabled</p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                          <h5 className="font-semibold text-green-900 mb-2">Analytics Cookies</h5>
                          <p className="text-sm text-green-800 mb-2">Help us understand how you use our platform</p>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Usage statistics</li>
                            <li>• Performance metrics</li>
                            <li>• User behavior analysis</li>
                          </ul>
                          <p className="text-xs text-green-700 mt-2">Can be disabled</p>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4">
                          <h5 className="font-semibold text-purple-900 mb-2">Functional Cookies</h5>
                          <p className="text-sm text-purple-800 mb-2">Remember your preferences and settings</p>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Language preferences</li>
                            <li>• Theme settings</li>
                            <li>• Customization options</li>
                          </ul>
                          <p className="text-xs text-purple-700 mt-2">Can be disabled</p>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4">
                          <h5 className="font-semibold text-yellow-900 mb-2">Targeting Cookies</h5>
                          <p className="text-sm text-yellow-800 mb-2">Used for advertising and marketing</p>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Interest-based advertising</li>
                            <li>• Marketing analytics</li>
                            <li>• Third-party tracking</li>
                          </ul>
                          <p className="text-xs text-yellow-700 mt-2">Can be disabled</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Managing Cookies</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Cookie Preferences</h5>
                            <p className="text-sm text-gray-600">
                              You can manage your cookie preferences through our cookie banner or browser settings.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Browser Controls</h5>
                            <p className="text-sm text-gray-600">
                              Most browsers allow you to block or delete cookies through their settings.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Impact of Disabling</h5>
                            <p className="text-sm text-gray-600">
                              Disabling certain cookies may affect your experience and some features may not work properly.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Children's Privacy Section */}
            {activeSection === 'children' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Children's Privacy</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Protecting Children's Privacy</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Age Restrictions</h4>
                      <p className="text-blue-800 mb-4">
                        Our platform is not intended for children under the age of 13 (or applicable minimum age in your jurisdiction). 
                        We do not knowingly collect personal information from children under this age.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Our Commitment</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• No marketing to children</li>
                            <li>• No data collection from minors</li>
                            <li>• Age-appropriate content</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Parental Rights</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Request data deletion</li>
                            <li>• Review child's information</li>
                            <li>• Object to data processing</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">If We Discover Underage Users</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          If we become aware that we have collected personal information from a child without parental consent, 
                          we will take immediate action:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Terminate the child's account</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Delete the child's personal information</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Notify parents or legal guardians</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Implement measures to prevent future occurrences</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Educational Use</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          For educational institutions using our platform with students:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">School Requirements</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Parental consent forms</li>
                              <li>• Educational supervision</li>
                              <li>• Age-appropriate access</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Data Protection</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Limited data collection</li>
                              <li>• Educational purpose only</li>
                              <li>• Secure storage</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-3">Parental Controls</h4>
                      <p className="text-yellow-800 mb-4">
                        We encourage parents and guardians to:
                      </p>
                      <ul className="space-y-2 text-yellow-800">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Monitor their children's online activities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Educate children about online privacy</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Use parental control tools</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Contact us with privacy concerns</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* International Users Section */}
            {activeSection === 'international' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">International Users</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Global Privacy Compliance</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Data Transfer</h4>
                      <p className="text-blue-800 mb-4">
                        Our platform serves users globally. Data may be transferred and processed in countries outside your own.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Transfer Mechanisms</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Standard Contractual Clauses</li>
                            <li>• Privacy Shield (where applicable)</li>
                            <li>• Adequacy decisions</li>
                            <li>• Binding Corporate Rules</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Protection Measures</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Enhanced security protocols</li>
                            <li>• Data localization options</li>
                            <li>• Compliance audits</li>
                            <li>• Regular assessments</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Regional Compliance</h4>
                      <div className="space-y-4">
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h5 className="font-semibold text-purple-900 mb-2">European Union (GDPR)</h5>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Lawful processing basis</li>
                            <li>• Data subject rights</li>
                            <li>• Data Protection Officer</li>
                            <li>• Breach notification</li>
                          </ul>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                          <h5 className="font-semibold text-green-900 mb-2">Singapore (PDPA)</h5>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Consent management</li>
                            <li>• Purpose limitation</li>
                            <li>• Do Not Call registry</li>
                            <li>• Data protection provisions</li>
                          </ul>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4">
                          <h5 className="font-semibold text-yellow-900 mb-2">California (CCPA/CPRA)</h5>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Right to know</li>
                            <li>• Right to delete</li>
                            <li>• Right to opt-out</li>
                            <li>• Non-discrimination</li>
                          </ul>
                        </div>

                        <div className="bg-red-50 rounded-lg p-4">
                          <h5 className="font-semibold text-red-900 mb-2">Other Regions</h5>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• UK GDPR</li>
                            <li>• Australian Privacy Act</li>
                            <li>• Canadian PIPEDA</li>
                            <li>• Japanese APPI</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Cross-Border Data Flows</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We implement appropriate safeguards for international data transfers:
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl mb-2">🔐</div>
                            <h5 className="font-semibold text-gray-700">Encryption</h5>
                            <p className="text-sm text-gray-600">End-to-end protection</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl mb-2">📋</div>
                            <h5 className="font-semibold text-gray-700">Contracts</h5>
                            <p className="text-sm text-gray-600">Legal agreements</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl mb-2">🔍</div>
                            <h5 className="font-semibold text-gray-700">Audits</h5>
                            <p className="text-sm text-gray-600">Regular compliance checks</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Changes Section */}
            {activeSection === 'changes' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Changes to Policy</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Policy Updates</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">When We Update</h4>
                      <p className="text-blue-800 mb-4">
                        We may update this privacy policy to reflect changes in our practices, services, or legal requirements.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Common Reasons</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• New features or services</li>
                            <li>• Changes in data practices</li>
                            <li>• Legal or regulatory updates</li>
                            <li>• User feedback</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Update Frequency</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• As needed</li>
                            <li>• Legal requirement changes</li>
                            <li>• Service updates</li>
                            <li>• Policy improvements</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Notification Process</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Notification Methods</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Email notification to registered users</li>
                              <li>• Platform banner announcement</li>
                              <li>• Updated "Last Modified" date</li>
                              <li>• In-app notifications</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Notice Period</h5>
                            <p className="text-sm text-gray-600">
                              We will provide reasonable notice before material changes take effect, typically 30 days for significant updates.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Reviewing Changes</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We encourage you to review this privacy policy periodically to stay informed about how we protect your information.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl mb-2">📅</div>
                            <h5 className="font-semibold text-gray-700">Regular Review</h5>
                            <p className="text-sm text-gray-600">Check periodically</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl mb-2">📧</div>
                            <h5 className="font-semibold text-gray-700">Email Alerts</h5>
                            <p className="text-sm text-gray-600">Opt-in for updates</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl mb-2">🔔</div>
                            <h5 className="font-semibold text-gray-700">Platform Notice</h5>
                            <p className="text-sm text-gray-600">In-app notifications</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-3">Acceptance of Changes</h4>
                      <p className="text-yellow-800 mb-4">
                        Continued use of our platform after policy changes constitutes acceptance of the updated privacy policy.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-yellow-800 mb-2">Your Options</h5>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Review and accept changes</li>
                            <li>• Contact us with questions</li>
                            <li>• Close your account if needed</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-yellow-800 mb-2">Account Closure</h5>
                          <p className="text-sm text-yellow-800">
                            If you disagree with changes, you may terminate your account.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy Questions & Concerns</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Privacy Team</h4>
                      <p className="text-blue-800 mb-4">
                        Our dedicated privacy team is available to address your questions and concerns about data privacy and protection.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Contact Information</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Email: privacy@raipplatform.sg</li>
                            <li>• Phone: +65 6XXX XXXX</li>
                            <li>• Mail: Privacy Officer, Singapore RAI Platform</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Response Time</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• General inquiries: 3-5 business days</li>
                            <li>• Data requests: 30 days</li>
                            <li>• Urgent matters: 24-48 hours</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Data Protection Officer</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          Our Data Protection Officer (DPO) is responsible for overseeing our privacy compliance:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Responsibilities</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Privacy policy oversight</li>
                              <li>• Compliance monitoring</li>
                              <li>• Staff training</li>
                              <li>• Regulatory liaison</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Contact DPO</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Email: dpo@raipplatform.sg</li>
                              <li>• Direct line: +65 6XXX XXXX</li>
                              <li>• Available Mon-Fri, 9AM-6PM</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Reporting Privacy Issues</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          If you have concerns about how we handle your data, you can:
                        </p>
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Step 1: Contact Us</h5>
                            <p className="text-sm text-gray-600">
                              Reach out to our privacy team with your specific concerns.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Step 2: Internal Review</h5>
                            <p className="text-sm text-gray-600">
                              We will investigate and respond within the specified timeframe.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Step 3: Regulatory Authority</h5>
                            <p className="text-sm text-gray-600">
                              If unsatisfied, you may contact the relevant data protection authority.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Regulatory Authorities</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Singapore</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Personal Data Protection Commission</li>
                              <li>• www.pdpc.gov.sg</li>
                              <li>• +65 6377 3131</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">European Union</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Data Protection Authorities</li>
                              <li>• National supervisory authorities</li>
                              <li>• European Data Protection Board</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-green-900 mb-3">Feedback & Suggestions</h4>
                      <p className="text-green-800 mb-4">
                        We welcome your feedback on how we can improve our privacy practices and this policy.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                          Send Feedback
                        </button>
                        <button className="bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 px-4 rounded-lg transition duration-300">
                          Request Improvement
                        </button>
                        <button className="bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 px-4 rounded-lg transition duration-300">
                          Report Issue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300">
                Download PDF
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300">
                Print Policy
              </button>
              <Link href="/contact" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300">
                Contact Privacy Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}