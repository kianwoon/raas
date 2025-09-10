"use client";

import { useState } from "react";
import Link from "next/link";

export default function AccessibilityPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const accessibilityFeatures = [
    {
      id: "overview",
      title: "Accessibility Overview",
      icon: "♿",
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            At Responsible AI Marketplace, we are committed to ensuring digital accessibility for people with disabilities. 
            We continually improve the user experience for everyone and apply the relevant accessibility standards.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-blue-800">
              <strong>Our Commitment:</strong> We strive to provide an inclusive experience that allows all users, 
              regardless of ability, to access and use our platform effectively.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-3">WCAG 2.1 AA</h3>
              <p className="text-gray-600 text-sm">
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, 
                the international standard for web accessibility.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-3">Continuous Improvement</h3>
              <p className="text-gray-600 text-sm">
                We regularly review and enhance our platform to ensure it remains accessible 
                to all users, including those using assistive technologies.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "features",
      title: "Accessibility Features",
      icon: "🔧",
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Built-in Accessibility Features</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Keyboard Navigation</h4>
                  <p className="text-gray-600 text-sm">Full keyboard accessibility with logical tab order and visible focus indicators.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Screen Reader Support</h4>
                  <p className="text-gray-600 text-sm">ARIA labels and semantic HTML for compatibility with screen readers.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">High Contrast Mode</h4>
                  <p className="text-gray-600 text-sm">Support for high contrast themes and sufficient color contrast ratios.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Responsive Design</h4>
                  <p className="text-gray-600 text-sm">Mobile-friendly layout that adapts to different screen sizes and orientations.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">5</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Text Resizing</h4>
                  <p className="text-gray-600 text-sm">Text that can be resized up to 200% without loss of functionality.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">6</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Error Identification</h4>
                  <p className="text-gray-600 text-sm">Clear error messages and instructions for form validation.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">7</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Alternative Text</h4>
                  <p className="text-gray-600 text-sm">Descriptive alt text for images and non-text content.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">8</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Time-based Media</h4>
                  <p className="text-gray-600 text-sm">Captions and alternatives for audio and video content.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "standards",
      title: "Standards & Compliance",
      icon: "📋",
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Accessibility Standards We Follow</h3>
          
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">WCAG 2.1</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Level AA</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Target
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Section 508</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">US Federal</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Compliant
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">EN 301 549</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">European</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      In Progress
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">WCAG 2.1 Principles</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-blue-600">Perceivable</p>
                <p className="text-sm text-gray-600">Information must be presentable in ways users can perceive.</p>
              </div>
              <div>
                <p className="font-medium text-blue-600">Operable</p>
                <p className="text-sm text-gray-600">Interface components must be operable by all users.</p>
              </div>
              <div>
                <p className="font-medium text-blue-600">Understandable</p>
                <p className="text-sm text-gray-600">Information and UI operation must be understandable.</p>
              </div>
              <div>
                <p className="font-medium text-blue-600">Robust</p>
                <p className="text-sm text-gray-600">Content must be robust enough for various assistive technologies.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "testing",
      title: "Testing & Validation",
      icon: "🔍",
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Our Accessibility Testing Process</h3>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Automated Testing</h4>
                <span className="text-sm text-gray-500">Ongoing</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Axe DevTools for accessibility issues detection</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>WAVE Web Accessibility Evaluator</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Lighthouse accessibility audits</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Continuous integration accessibility checks</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Manual Testing</h4>
                <span className="text-sm text-gray-500">Quarterly</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Keyboard-only navigation testing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Screen reader compatibility (JAWS, NVDA, VoiceOver)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Color contrast validation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Mobile device accessibility testing</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">User Testing</h4>
                <span className="text-sm text-gray-500">Bi-annual</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Testing with users of assistive technologies</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Feedback from disability advocacy groups</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Usability testing with diverse user groups</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "feedback",
      title: "Feedback & Support",
      icon: "💬",
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">We Value Your Feedback</h3>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-blue-800">
              If you encounter any accessibility barriers while using our platform, please let us know. 
              We take all feedback seriously and work to address issues promptly.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="font-semibold text-gray-900 mb-3">Report Accessibility Issues</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    placeholder="Please describe the accessibility issue you encountered..."
                  ></textarea>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  Submit Report
                </button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-blue-600">📧</span>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">accessibility@responsibleaimarketplace.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-blue-600">📞</span>
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">+65 1234 5678</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-blue-600">🕒</span>
                  <div>
                    <p className="font-medium text-gray-900">Response Time</p>
                    <p className="text-sm text-gray-600">Within 2 business days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Alternative Access Methods</h4>
            <p className="text-sm text-gray-600">
              If you are unable to access our platform through standard means, please contact us for 
              alternative access arrangements. We are committed to providing equal access to all users.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "future",
      title: "Future Improvements",
      icon: "🚀",
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Our Accessibility Roadmap</h3>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Short-term Goals (Next 3 months)</h4>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Planned
                </span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>Implement comprehensive ARIA labeling throughout the platform</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>Add keyboard shortcuts for common actions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>Enhance color contrast for all interactive elements</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>Implement skip navigation links</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Medium-term Goals (Next 6 months)</h4>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  In Planning
                </span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Implement text-to-speech functionality for key content</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Add sign language interpretation for video content</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Create accessible mobile application</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Implement customizable user interface options</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Long-term Goals (Next 12 months)</h4>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  Future
                </span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  <span>Achieve WCAG 2.1 AAA compliance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  <span>Implement AI-powered accessibility features</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  <span>Develop accessibility training programs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  <span>Establish accessibility certification</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Accessibility Statement
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Building an inclusive platform for everyone, regardless of ability
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-4 py-2 rounded-full">WCAG 2.1 AA</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Screen Reader Friendly</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Keyboard Accessible</span>
              <span className="bg-white/20 px-4 py-2 rounded-full">Mobile Optimized</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <nav className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Navigation</h3>
                  <ul className="space-y-2">
                    {accessibilityFeatures.map((feature) => (
                      <li key={feature.id}>
                        <button
                          onClick={() => setActiveSection(feature.id)}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            activeSection === feature.id
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className="mr-2">{feature.icon}</span>
                          {feature.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
                
                {/* Quick Actions */}
                <div className="mt-6 bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link 
                      href="/contact"
                      className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Contact Support
                    </Link>
                    <button className="w-full bg-white text-blue-600 border border-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors">
                      Download Statement
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-8">
                {accessibilityFeatures.map((feature) => (
                  <section
                    key={feature.id}
                    id={feature.id}
                    className={`mb-12 scroll-mt-8 ${
                      activeSection === feature.id ? "" : "hidden"
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <span className="text-3xl">{feature.icon}</span>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {feature.title}
                      </h2>
                    </div>
                    {feature.content}
                  </section>
                ))}
              </div>
              
              {/* Last Updated */}
              <div className="mt-8 text-center text-sm text-gray-500">
                <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="mt-1">Version 1.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}