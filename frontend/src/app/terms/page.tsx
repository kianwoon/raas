'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', name: 'Overview', icon: '📋' },
    { id: 'acceptance', name: 'Acceptance', icon: '✅' },
    { id: 'service-description', name: 'Service Description', icon: '🔧' },
    { id: 'user-accounts', name: 'User Accounts', icon: '👤' },
    { id: 'acceptable-use', name: 'Acceptable Use', icon: '⚖️' },
    { id: 'intellectual-property', name: 'Intellectual Property', icon: '💡' },
    { id: 'user-content', name: 'User Content', icon: '📝' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' },
    { id: 'disclaimers', name: 'Disclaimers', icon: '⚠️' },
    { id: 'limitation-of-liability', name: 'Limitation of Liability', icon: '🛡️' },
    { id: 'indemnification', name: 'Indemnification', icon: '🤝' },
    { id: 'termination', name: 'Termination', icon: '🚫' },
    { id: 'changes', name: 'Changes', icon: '📝' },
    { id: 'governing-law', name: 'Governing Law', icon: '⚖️' },
    { id: 'dispute-resolution', name: 'Dispute Resolution', icon: '⚖️' },
    { id: 'contact', name: 'Contact', icon: '📧' },
  ];

  const lastUpdated = 'November 2024';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
            <p className="text-xl text-purple-100 mb-8">
              These terms govern your use of the Singapore RAI Platform. Please read them carefully.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-purple-500 px-3 py-1 rounded-full">Last Updated: {lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-purple-500 px-3 py-1 rounded-full">Legal Agreement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-purple-500 px-3 py-1 rounded-full">Binding Contract</span>
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
                      ? 'bg-purple-600 text-white'
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
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold text-purple-900 mb-4">At a Glance</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-purple-800 mb-2">What You Get</h4>
                        <ul className="space-y-1 text-purple-700">
                          <li>• Model card creation tools</li>
                          <li>• Fairness assessment features</li>
                          <li>• Transparency reporting</li>
                          <li>• Community resources</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-800 mb-2">Your Responsibilities</h4>
                        <ul className="space-y-1 text-purple-700">
                          <li>• Provide accurate information</li>
                          <li>• Use platform responsibly</li>
                          <li>• Respect intellectual property</li>
                          <li>• Comply with applicable laws</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Singapore RAI Platform</h3>
                  <p className="text-gray-600 mb-4">
                    These Terms of Service ("Terms") constitute a legally binding agreement between you and Singapore RAI Platform 
                    ("we," "us," or "our") governing your use of our platform, services, and website (collectively, the "Service").
                  </p>
                  <p className="text-gray-600 mb-4">
                    By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy. 
                    If you do not agree to these Terms, please do not use our Service.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🎯</div>
                      <h4 className="font-semibold text-gray-900">Purpose-Driven</h4>
                      <p className="text-sm text-gray-600">Advancing responsible AI</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">🤝</div>
                      <h4 className="font-semibold text-gray-900">Community-Focused</h4>
                      <p className="text-sm text-gray-600">Collaborative platform</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-2">⚖️</div>
                      <h4 className="font-semibold text-gray-900">Compliant</h4>
                      <p className="text-sm text-gray-600">Legal and ethical standards</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-yellow-900 mb-3">Important Notice</h4>
                  <p className="text-yellow-800">
                    This Service is provided for educational and research purposes. While we strive to provide accurate and helpful information, 
                    we make no warranties about the completeness, reliability, or accuracy of our platform or content.
                  </p>
                </div>
              </div>
            )}

            {/* Acceptance Section */}
            {activeSection === 'acceptance' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Acceptance of Terms</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Binding Agreement</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">By Using Our Service</h4>
                      <ul className="space-y-2 text-blue-800">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>You acknowledge that you have read, understood, and agree to be bound by these Terms</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>You represent that you have the legal capacity to enter into this agreement</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>You agree to comply with all applicable laws and regulations</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Age Requirements</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Minimum Age:</strong> You must be at least 13 years old to use our Service</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Parental Consent:</strong> Users under 18 require parental consent</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Age Verification:</strong> We may verify age and parental consent</span>
                          </li>
                        </ul>
                    </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Accountability</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          You are responsible for maintaining the confidentiality of your account information and for all activities 
                          that occur under your account.
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Immediately notify us of any unauthorized use of your account</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Keep your password secure and confidential</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Accept responsibility for all activities under your account</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-red-900 mb-3">Violation Consequences</h4>
                      <p className="text-red-800">
                        Failure to comply with these Terms may result in termination of your account, suspension of access to our Service, 
                        and other legal remedies available to us.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Description Section */}
            {activeSection === 'service-description' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Service Description</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">What We Provide</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-green-900 mb-3">Core Features</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold text-green-800 mb-2">Model Card Management</h5>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Create and edit model cards</li>
                            <li>• Standardized templates</li>
                            <li>• Version control</li>
                            <li>• Export capabilities</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-800 mb-2">Fairness Assessment</h5>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Bias detection tools</li>
                            <li>• Fairness metrics</li>
                            <li>• Performance analysis</li>
                            <li>• Comparative evaluation</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-800 mb-2">Transparency Tools</h5>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Explainable AI features</li>
                            <li>• Decision documentation</li>
                            <li>• Audit trails</li>
                            <li>• Transparency reports</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-800 mb-2">Community Resources</h5>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Educational materials</li>
                            <li>• Best practices</li>
                            <li>• Case studies</li>
                            <li>• Research papers</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Service Availability</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Availability</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• 24/7 online access</li>
                              <li>• Scheduled maintenance windows</li>
                              <li>• Service level agreements</li>
                              <li>• Uptime monitoring</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Supported Platforms</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Web browsers (Chrome, Firefox, Safari, Edge)</li>
                              <li>• Mobile devices (iOS, Android)</li>
                              <li>• Tablet devices</li>
                              <li>• Desktop computers</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Service Limitations</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          Our Service is provided on an "as is" and "as available" basis. We do not guarantee:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Uninterrupted or error-free operation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Specific results or outcomes from using our tools</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Compatibility with all third-party systems</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Complete accuracy of fairness assessments or metrics</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-3">Beta Features</h4>
                      <p className="text-yellow-800 mb-3">
                        We may offer beta or preview features that are still in development. These features are provided 
                        "as is" and may not be fully functional or reliable.
                      </p>
                      <ul className="space-y-2 text-yellow-800">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Beta features may be changed or discontinued without notice</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Your use of beta features is at your own risk</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>We may collect additional data about beta feature usage</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Accounts Section */}
            {activeSection === 'user-accounts' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">User Accounts</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Registration and Management</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Registration Requirements</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          To create an account, you must provide:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Valid email address</strong> - Must be accessible and under your control</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Accurate information</strong> - Complete and truthful personal details</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Secure password</strong> - Meeting our security requirements</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Organization details</strong> - For professional or institutional accounts</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Account Security</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          You are responsible for maintaining the security of your account:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Your Responsibilities</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Keep password confidential</li>
                              <li>• Use strong, unique passwords</li>
                              <li>• Enable two-factor authentication</li>
                              <li>• Monitor account activity</li>
                              <li>• Report suspicious activity</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Security Measures</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Encryption of sensitive data</li>
                              <li>• Regular security audits</li>
                              <li>• Suspicious activity detection</li>
                              <li>• Session management</li>
                              <li>• Account recovery options</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Account Types</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h5 className="font-semibold text-blue-800 mb-2">Individual Accounts</h5>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Personal use only</li>
                              <li>• Basic features access</li>
                              <li>• Community participation</li>
                              <li>• Educational resources</li>
                            </ul>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <h5 className="font-semibold text-green-800 mb-2">Organizational Accounts</h5>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>• Multiple user management</li>
                              <li>• Advanced features</li>
                              <li>• Team collaboration</li>
                              <li>• Priority support</li>
                            </ul>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h5 className="font-semibold text-purple-800 mb-2">Research/Educational Accounts</h5>
                            <ul className="text-sm text-purple-800 space-y-1">
                              <li>• Academic pricing</li>
                              <li>• Research tools</li>
                              <li>• Educational resources</li>
                              <li>• Collaboration features</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-red-900 mb-3">Account Termination</h4>
                      <p className="text-red-800 mb-3">
                        We reserve the right to suspend or terminate your account for:
                      </p>
                      <ul className="space-y-2 text-red-800">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>Violation of these Terms</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>Fraudulent or illegal activities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>Security breaches or unauthorized access</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>Inactivity for extended periods (12+ months)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>Request by law enforcement or regulatory authorities</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Acceptable Use Section */}
            {activeSection === 'acceptable-use' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Acceptable Use</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Permitted and Prohibited Uses</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-green-900 mb-3">Permitted Uses</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold text-green-800 mb-2">Model Card Creation</h5>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Document AI models responsibly</li>
                            <li>• Share model information transparently</li>
                            <li>• Collaborate on model improvements</li>
                            <li>• Educational and research purposes</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-800 mb-2">Fairness Assessment</h5>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Evaluate model bias</li>
                            <li>• Improve model fairness</li>
                            <li>• Compare model performance</li>
                            <li>• Research AI fairness</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-800 mb-2">Community Engagement</h5>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Share knowledge and best practices</li>
                            <li>• Provide constructive feedback</li>
                            <li>• Collaborate on research</li>
                            <li>• Participate in discussions</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-800 mb-2">Educational Activities</h5>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Learn about responsible AI</li>
                            <li>• Teach AI ethics and fairness</li>
                            <li>• Use platform for training</li>
                            <li>• Academic research</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-red-900 mb-3">Prohibited Uses</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold text-red-800 mb-2">Illegal Activities</h5>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• Violate laws or regulations</li>
                            <li>• Facilitate criminal activities</li>
                            <li>• Infringe intellectual property</li>
                            <li>• Engage in fraud or deception</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-red-800 mb-2">Harmful Content</h5>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• Hate speech or discrimination</li>
                            <li>• Harassment or bullying</li>
                            <li>• Violent or explicit content</li>
                            <li>• Misinformation or disinformation</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-red-800 mb-2">Technical Abuse</h5>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• Hacking or unauthorized access</li>
                            <li>• Malware or viruses</li>
                            <li>• Denial of service attacks</li>
                            <li>• Data mining or scraping</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-red-800 mb-2">Platform Abuse</h5>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• Spam or unsolicited messages</li>
                            <li>• Fake accounts or impersonation</li>
                            <li>• Circumventing security measures</li>
                            <li>• Interfering with service operation</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Professional Conduct</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          When using our platform, you agree to:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Be respectful and professional in all interactions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Provide accurate and truthful information</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Respect intellectual property rights</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Follow community guidelines and standards</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Report violations of these Terms</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-3">Consequences of Violations</h4>
                      <p className="text-yellow-800 mb-3">
                        Violations of acceptable use policies may result in:
                      </p>
                      <ul className="space-y-2 text-yellow-800">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Warning or notice of violation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Temporary or permanent account suspension</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Removal of content or model cards</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Legal action or reporting to authorities</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Intellectual Property Section */}
            {activeSection === 'intellectual-property' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Intellectual Property</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ownership and Rights</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Our Intellectual Property</h4>
                      <p className="text-blue-800 mb-4">
                        We retain all rights, title, and interest in and to our Service, including:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Platform Technology</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Software and algorithms</li>
                            <li>• User interface design</li>
                            <li>• System architecture</li>
                            <li>• Proprietary tools</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Content and Materials</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Documentation and guides</li>
                            <li>• Templates and frameworks</li>
                            <li>• Educational materials</li>
                            <li>• Brand elements and logos</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Your Intellectual Property</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          You retain ownership of your intellectual property, including:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Model cards</strong> - Content you create and upload</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Models and data</strong> - Your AI models and training data</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Feedback and contributions</strong> - Ideas and suggestions you provide</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Custom implementations</strong> - Code or solutions you develop</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Licenses and Permissions</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">License to Us</h5>
                            <p className="text-sm text-gray-600">
                              By uploading content to our platform, you grant us a worldwide, non-exclusive, royalty-free license 
                              to use, reproduce, modify, and display your content for the purpose of providing our Service.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">License to You</h5>
                            <p className="text-sm text-gray-600">
                              We grant you a limited, non-exclusive, non-transferable license to access and use our Service 
                              for your personal or professional use.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Trademarks</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          All trademarks, service marks, and trade names used in our Service are the property of their respective owners.
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Singapore RAI Platform</strong> is our trademark</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>You may not use our trademarks without permission</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>All other trademarks belong to their respective owners</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-3">Copyright Infringement</h4>
                      <p className="text-yellow-800 mb-3">
                        We respect intellectual property rights and respond to notices of alleged infringement.
                      </p>
                      <p className="text-yellow-800">
                        If you believe your copyrighted work has been copied in a way that constitutes copyright infringement, 
                        please contact us with detailed information about the alleged infringement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Content Section */}
            {activeSection === 'user-content' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">User Content</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Content You Create and Share</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Model Card Content</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          When creating model cards, you are responsible for:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Accuracy</strong> - Providing truthful and complete information</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Compliance</strong> - Following applicable laws and regulations</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Rights</strong> - Having necessary rights to share the content</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Updates</strong> - Keeping information current and accurate</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Content Standards</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          All content shared on our platform must:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Required Standards</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Be accurate and truthful</li>
                              <li>• Comply with applicable laws</li>
                              <li>• Respect intellectual property</li>
                              <li>• Be professional and appropriate</li>
                              <li>• Follow technical specifications</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Prohibited Content</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Illegal or harmful content</li>
                              <li>• Misleading or false information</li>
                              <li>• Infringing material</li>
                              <li>• Malicious code or content</li>
                              <li>• Spam or promotional content</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Content Moderation</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We reserve the right to:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Review and moderate content for compliance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Remove or disable access to violating content</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Report illegal content to authorities</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Suspend accounts for repeated violations</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Content Sharing and Distribution</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          You may share your model cards and content:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Sharing Options</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Public sharing with community</li>
                              <li>• Private sharing with organizations</li>
                              <li>• Team collaboration</li>
                              <li>• Export for external use</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Control Features</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Access permissions</li>
                              <li>• Version control</li>
                              <li>• Sharing restrictions</li>
                              <li>• Usage analytics</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-red-900 mb-3">Content Liability</h4>
                      <p className="text-red-800 mb-3">
                        You are solely responsible for the content you create and share on our platform.
                      </p>
                      <ul className="space-y-2 text-red-800">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>You assume all liability for your content</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>We are not responsible for user-generated content</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>You indemnify us for claims related to your content</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Privacy</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy Protection</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Privacy Policy</h4>
                      <p className="text-blue-800 mb-4">
                        Our Privacy Policy explains how we collect, use, and protect your personal information. 
                        By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Link href="/privacy" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                          View Privacy Policy
                        </Link>
                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded-lg transition duration-300">
                          Download PDF
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Data Collection</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We collect information to provide and improve our Service:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Information Collected</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Account information</li>
                              <li>• Model card data</li>
                              <li>• Usage analytics</li>
                              <li>• Technical information</li>
                              <li>• Communication preferences</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Collection Methods</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Direct user input</li>
                              <li>• Automated collection</li>
                              <li>• Cookies and tracking</li>
                              <li>• Third-party integrations</li>
                              <li>• Analytics tools</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Data Use</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We use your information to:
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Service Provision</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Provide platform features</li>
                              <li>• Process model cards</li>
                              <li>• Enable user accounts</li>
                              <li>• Facilitate sharing</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Platform Improvement</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Analyze usage patterns</li>
                              <li>• Improve user experience</li>
                              <li>• Develop new features</li>
                              <li>• Optimize performance</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Communication</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Send service updates</li>
                              <li>• Provide support</li>
                              <li>• Share important notices</li>
                              <li>• Respond to inquiries</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Data Protection</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We implement industry-standard security measures to protect your information:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Technical Security</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Encryption in transit and at rest</li>
                              <li>• Secure authentication</li>
                              <li>• Access controls</li>
                              <li>• Regular security audits</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Organizational Security</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Employee training</li>
                              <li>• Data minimization</li>
                              <li>• Privacy by design</li>
                              <li>• Compliance monitoring</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-green-900 mb-3">Your Privacy Rights</h4>
                      <p className="text-green-800 mb-3">
                        You have rights regarding your personal information:
                      </p>
                      <ul className="space-y-2 text-green-800">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Access and review your information</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Correct inaccurate information</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Request deletion of your data</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Export your data in portable format</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Opt out of marketing communications</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Disclaimers Section */}
            {activeSection === 'disclaimers' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Disclaimers</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Important Disclaimers</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-3">"As Is" Service</h4>
                      <p className="text-yellow-800 mb-4">
                        Our Service is provided on an "as is" and "as available" basis, without any warranties of any kind, 
                        either express or implied.
                      </p>
                      <ul className="space-y-2 text-yellow-800">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>We do not guarantee uninterrupted or error-free operation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>We make no warranties about the accuracy or reliability of our Service</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>We disclaim all implied warranties of merchantability and fitness</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Professional Advice</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          Our Service does not provide professional advice:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Not Legal Advice</strong> - Our content is not a substitute for professional legal counsel</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Not Technical Advice</strong> - Consult qualified professionals for technical implementations</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Not Business Advice</strong> - Seek professional guidance for business decisions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Not Medical Advice</strong> - Our Service is not for medical applications</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Model Card Limitations</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          Model cards created on our platform have limitations:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Documentation Only</strong> - Model cards are documentation, not the actual models</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>User Responsibility</strong> - Users are responsible for model accuracy and compliance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Fairness Assessments</strong> - Our tools provide guidance, not guarantees of fairness</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Evolving Standards</strong> - AI fairness standards continue to evolve</span>
                          </li>
                        </ul>
                    </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Third-Party Content</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          Our Service may contain links to third-party websites or content:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>We are not responsible for third-party content or websites</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Third-party content may have different privacy policies</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>We do not endorse or guarantee third-party content</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-red-900 mb-3">No Warranty</h4>
                      <p className="text-red-800">
                        To the fullest extent permitted by law, we disclaim all warranties, express or implied, 
                        including but not limited to implied warranties of merchantability, fitness for a particular 
                        purpose, and non-infringement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Limitation of Liability Section */}
            {activeSection === 'limitation-of-liability' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Liability Limitations</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-red-900 mb-3">Limitation of Damages</h4>
                      <p className="text-red-800 mb-4">
                        To the maximum extent permitted by law, our liability for any claim related to our Service 
                        is limited to the amount you paid to us in the 12 months preceding the claim.
                      </p>
                      <ul className="space-y-2 text-red-800">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span><strong>Direct Damages Only</strong> - We are not liable for indirect, incidental, or consequential damages</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span><strong>No Special Damages</strong> - Including lost profits, revenue, or business opportunities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span><strong>No Punitive Damages</strong> - We are not liable for punitive or exemplary damages</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span><strong>Free Service Limitation</strong> - For free users, liability is limited to $0</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Excluded Damages</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We are not liable for:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Financial Losses</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Lost profits</li>
                              <li>• Lost revenue</li>
                              <li>• Business interruption</li>
                              <li>• Loss of data</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Consequential Damages</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Indirect damages</li>
                              <li>• Incidental damages</li>
                              <li>• Punitive damages</li>
                              <li>• Emotional distress</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Third-Party Liability</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We are not liable for:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Actions of third parties using our Service</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Third-party content or websites</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>User-generated content or model cards</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Internet or system failures</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Service Interruptions</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We are not liable for:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Service interruptions or downtime</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Data loss or corruption</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>System errors or bugs</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Maintenance or upgrades</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-3">Important Notice</h4>
                      <p className="text-yellow-800">
                        Some jurisdictions do not allow the exclusion or limitation of liability for consequential or incidental damages, 
                        so these limitations may not apply to you. These limitations shall apply to the fullest extent permitted by law.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Indemnification Section */}
            {activeSection === 'indemnification' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Indemnification</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Indemnification Obligations</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-orange-900 mb-3">Indemnification Agreement</h4>
                      <p className="text-orange-800 mb-4">
                        You agree to indemnify, defend, and hold harmless Singapore RAI Platform and its affiliates, 
                        officers, directors, employees, and agents from and against any claims, liabilities, damages, 
                        losses, and expenses, including reasonable attorneys' fees, arising out of or in any way 
                        connected with:
                      </p>
                      <ul className="space-y-2 text-orange-800">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>Your use of our Service</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>Your violation of these Terms</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>Your violation of third-party rights</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>Your user-generated content or model cards</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>Your violation of applicable laws or regulations</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Indemnification Process</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          If we are subject to a claim that requires indemnification:
                        </p>
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Notice</h5>
                            <p className="text-sm text-gray-600">
                              We will promptly notify you of any claim for which we may require indemnification.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Control</h5>
                            <p className="text-sm text-gray-600">
                              We reserve the right to assume the exclusive defense and control of any matter subject to indemnification.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Cooperation</h5>
                            <p className="text-sm text-gray-600">
                              You agree to cooperate with us in the defense of any such claim, including providing reasonable assistance.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Settlement</h5>
                            <p className="text-sm text-gray-600">
                              You may not settle any claim without our prior written consent.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Examples of Indemnifiable Claims</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Intellectual Property Claims</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Copyright infringement</li>
                              <li>• Trademark violations</li>
                              <li>• Patent infringement</li>
                              <li>• Trade secret misappropriation</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Other Claims</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Defamation or libel</li>
                              <li>• Privacy violations</li>
                              <li>• Breach of contract</li>
                              <li>• Regulatory violations</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-red-900 mb-3">Financial Responsibility</h4>
                      <p className="text-red-800 mb-3">
                        You agree to be financially responsible for:
                      </p>
                      <ul className="space-y-2 text-red-800">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>All costs of defending against claims</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>Settlement amounts and judgments</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>Reasonable attorneys' fees and costs</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600 mt-1">•</span>
                          <span>Any other expenses related to claims</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Termination Section */}
            {activeSection === 'termination' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Termination</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Account and Service Termination</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Termination by You</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          You may terminate your account and use of our Service at any time:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Account Settings</strong> - Terminate through your account settings</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Immediate Effect</strong> - Termination takes effect immediately</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Data Export</strong> - Export your data before termination</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span><strong>Final Charges</strong> - Pay any outstanding fees</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Termination by Us</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We may terminate your account and access to our Service for:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Violation Reasons</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Material breach of Terms</li>
                              <li>• Illegal or fraudulent activities</li>
                              <li>• Repeated policy violations</li>
                              <li>• Security threats or breaches</li>
                              <li>• Infringement of third-party rights</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Other Reasons</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Extended inactivity (12+ months)</li>
                              <li>• Bankruptcy or insolvency</li>
                              <li>• Government or legal requirements</li>
                              <li>• Business necessity or discontinuation</li>
                              <li>• Force majeure events</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Termination Process</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Notice</h5>
                            <p className="text-sm text-gray-600">
                              We will provide reasonable notice before termination, except in cases of immediate termination 
                              for security, legal, or safety reasons.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Suspension</h5>
                            <p className="text-sm text-gray-600">
                              We may suspend your account temporarily pending investigation of potential violations.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Data Handling</h5>
                            <p className="text-sm text-gray-600">
                              Upon termination, we may delete or anonymize your data in accordance with our Privacy Policy.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Effects of Termination</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          Upon termination:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Access to your account and our Service will be disabled</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Your right to use our Service immediately terminates</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>We may delete your data subject to our Privacy Policy</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Any outstanding fees become immediately due</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Certain provisions survive termination (see below)</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-3">Surviving Provisions</h4>
                      <p className="text-yellow-800 mb-3">
                        The following provisions survive termination of these Terms:
                      </p>
                      <ul className="space-y-2 text-yellow-800">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Intellectual Property Rights</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Disclaimer of Warranties</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Limitation of Liability</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Indemnification</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Governing Law and Dispute Resolution</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>Confidentiality and Privacy</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Changes Section */}
            {activeSection === 'changes' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Changes to Terms</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Modifications to Terms</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Right to Modify</h4>
                      <p className="text-blue-800 mb-4">
                        We reserve the right to modify these Terms at any time. Changes will be effective immediately 
                        upon posting the revised Terms on our platform.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Common Reasons for Changes</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• New features or services</li>
                            <li>• Changes in applicable laws</li>
                            <li>• Business model changes</li>
                            <li>• User feedback and suggestions</li>
                            <li>• Security or technical requirements</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Types of Changes</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Adding new features</li>
                            <li>• Modifying existing policies</li>
                            <li>• Updating fee structures</li>
                            <li>• Clarifying obligations</li>
                            <li>• Improving user experience</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Notification of Changes</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We will notify users of material changes to these Terms:
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Notification Methods</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Email notification</li>
                              <li>• Platform banner</li>
                              <li>• In-app notification</li>
                              <li>• Updated "Last Modified" date</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Notice Period</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• 30 days for major changes</li>
                              <li>• Immediate for security changes</li>
                              <li>• 7 days for minor updates</li>
                              <li>• As required by law</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Material Changes</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Fee changes</li>
                              <li>• Significant feature changes</li>
                              <li>• Rights or obligations</li>
                              <li>• Liability limitations</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Your Responsibility</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          You are responsible for:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Regular Review</strong> - Periodically reviewing these Terms for changes</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Accepting Changes</strong> - Continued use constitutes acceptance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Understanding Changes</strong> - Reviewing and understanding modifications</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Account Closure</strong> - Terminating account if disagreeing with changes</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Continued Use</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          Your continued use of our Service after changes to these Terms constitutes acceptance of the modified Terms.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">If You Agree</h5>
                            <p className="text-sm text-gray-600">
                              Continue using our Service under the updated Terms.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">If You Disagree</h5>
                            <p className="text-sm text-gray-600">
                              Stop using our Service and close your account.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-3">Historical Versions</h4>
                      <p className="text-yellow-800 mb-3">
                        We may maintain archives of previous versions of these Terms for reference.
                      </p>
                      <p className="text-yellow-800">
                        If you have questions about changes to these Terms, please contact our support team.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Governing Law Section */}
            {activeSection === 'governing-law' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Governing Law</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Legal Jurisdiction</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Governing Law</h4>
                      <p className="text-blue-800 mb-4">
                        These Terms and your use of our Service are governed by and construed in accordance with 
                        the laws of the Republic of Singapore, without regard to its conflict of law principles.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Applicable Laws</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Singapore Personal Data Protection Act (PDPA)</li>
                            <li>• Singapore Electronic Transactions Act</li>
                            <li>• Common law principles</li>
                            <li>• Industry regulations</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Legal Principles</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Contract law</li>
                            <li>• Intellectual property law</li>
                            <li>• Privacy and data protection law</li>
                            <li>• Consumer protection law</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Jurisdiction and Venue</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          You agree to submit to the exclusive jurisdiction of the courts of Singapore for any 
                          legal matters arising from these Terms or your use of our Service.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Jurisdiction</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Singapore courts</li>
                              <li>• State Courts</li>
                              <li>• High Court of Singapore</li>
                              <li>• Court of Appeal</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Venue</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Singapore proper</li>
                              <li>• Convenient forum</li>
                              <li>• Exclusive jurisdiction</li>
                              <li>• No inconvenient forum</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">International Users</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          If you are accessing our Service from outside Singapore:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>You are responsible for compliance with local laws</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>Singapore law governs these Terms regardless of your location</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>You may be subject to additional local regulations</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span>You are responsible for any applicable taxes or duties</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Legal Compliance</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          You agree to comply with all applicable laws and regulations in connection with your use of our Service:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Data Protection Laws</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• PDPA (Singapore)</li>
                              <li>• GDPR (EU)</li>
                              <li>• CCPA/CPRA (California)</li>
                              <li>• Local privacy laws</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Other Regulations</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Export control laws</li>
                              <li>• Sanctions regulations</li>
                              <li>• Consumer protection laws</li>
                              <li>• Industry-specific regulations</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-green-900 mb-3">Legal Cooperation</h4>
                      <p className="text-green-800 mb-3">
                        We cooperate with legal authorities and comply with lawful requests for information:
                      </p>
                      <ul className="space-y-2 text-green-800">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Government investigations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Law enforcement requests</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Regulatory inquiries</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>Court orders and subpoenas</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dispute Resolution Section */}
            {activeSection === 'dispute-resolution' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Dispute Resolution</h2>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Resolving Disputes</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">Informal Resolution</h4>
                      <p className="text-blue-800 mb-4">
                        We encourage users to resolve disputes informally through direct communication:
                      </p>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Step 1: Contact Us</h5>
                          <p className="text-sm text-blue-800">
                            Reach out to our support team with your concern.
                          </p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Step 2: Discussion</h5>
                          <p className="text-sm text-blue-800">
                            We will review and respond to your issue promptly.
                          </p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Step 3: Resolution</h5>
                          <p className="text-sm text-blue-800">
                            Work together to find a mutually acceptable solution.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Formal Dispute Resolution</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          If informal resolution is not possible, disputes will be resolved through:
                        </p>
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Negotiation</h5>
                            <p className="text-sm text-gray-600">
                              Parties will attempt to resolve disputes through good faith negotiation.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Mediation</h5>
                            <p className="text-sm text-gray-600">
                              If negotiation fails, parties may agree to mediation with a neutral third party.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Arbitration</h5>
                            <p className="text-sm text-gray-600">
                              Unresolved disputes may be submitted to binding arbitration under Singapore law.
                            </p>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Litigation</h5>
                            <p className="text-sm text-gray-600">
                              As a last resort, disputes may be resolved in the courts of Singapore.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Time Limits</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          Legal claims related to these Terms or our Service must be filed within:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>One Year</strong> from the date the claim arises</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Statute of Limitations</strong> - Claims filed after this period may be barred</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Exceptions</strong> - Certain claims may have different time limits</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Class Action Waiver</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          You agree to resolve disputes individually and waive any right to participate in class actions:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>No Class Actions</strong> - You may not bring claims as a class representative</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>No Consolidation</strong> - Claims cannot be consolidated with others</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-1">•</span>
                            <span><strong>Individual Proceedings</strong> - Each claim must be resolved individually</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-yellow-900 mb-3">Emergency Relief</h4>
                      <p className="text-yellow-800 mb-3">
                        Nothing in this section prevents either party from seeking emergency relief from courts 
                        of competent jurisdiction.
                      </p>
                      <p className="text-yellow-800">
                        Emergency relief may include injunctions, temporary restraining orders, or other immediate remedies.
                      </p>
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-blue-900 mb-3">General Inquiries</h4>
                      <p className="text-blue-800 mb-4">
                        For questions about our Service, these Terms, or general support:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Contact Information</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Email: support@raipplatform.sg</li>
                            <li>• Phone: +65 6XXX XXXX</li>
                            <li>• Hours: Mon-Fri, 9AM-6PM (SGT)</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-800 mb-2">Response Time</h5>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• General inquiries: 1-2 business days</li>
                            <li>• Technical support: 2-3 business days</li>
                            <li>• Urgent issues: 24 hours</li>
                          </ul>
                        </div>
                    </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Legal Inquiries</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          For legal matters, copyright claims, or official correspondence:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Legal Department</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              <li>• Email: legal@raipplatform.sg</li>
                              <li>• Mail: Legal Department, Singapore RAI Platform</li>
                              <li>• Address: [Your Business Address]</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Copyright Claims</h5>
                                <ul className="text-sm text-gray-600 space-y-1">
                              <li>• DMCA Agent: copyright@raipplatform.sg</li>
                              <li>• Follow standard DMCA procedures</li>
                              <li>• Include all required information</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Feedback and Suggestions</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          We value your feedback and suggestions for improving our Service:
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                            Send Feedback
                          </button>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                            Report Issue
                          </button>
                          <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                            Request Feature
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Emergency Contact</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-3">
                          For urgent security or privacy concerns:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 mt-1">•</span>
                            <span><strong>Security Issues:</strong> security@raipplatform.sg</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 mt-1">•</span>
                            <span><strong>Data Breaches:</strong> breach@raipplatform.sg</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 mt-1">•</span>
                            <span><strong>Privacy Concerns:</strong> privacy@raipplatform.sg</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-green-900 mb-3">Community Resources</h4>
                      <p className="text-green-800 mb-3">
                        Connect with our community for additional support and resources:
                      </p>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-semibold text-green-800 mb-2">Documentation</h5>
                          <p className="text-sm text-green-800">
                            Comprehensive guides and tutorials
                          </p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-800 mb-2">Community Forum</h5>
                          <p className="text-sm text-green-800">
                            Connect with other users and experts
                          </p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-800 mb-2">Knowledge Base</h5>
                          <p className="text-sm text-green-800">
                            FAQs and troubleshooting guides
                          </p>
                        </div>
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
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300">
                Download PDF
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300">
                Print Terms
              </button>
              <Link href="/privacy" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300">
                View Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}