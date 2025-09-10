'use client';

import { useState } from 'react';
import Link from 'next/link';

export function HeroSection() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
    // Show success message
    alert('Thank you for subscribing to our newsletter!');
  };

  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative container mx-auto px-4 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fadeIn">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Advancing <span className="text-yellow-300 animate-pulse-slow">Responsible AI</span> Through Transparency
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 animate-fadeIn" style={{animationDelay: '0.3s'}}>
              The Singapore RAI Platform promotes fairness, ethics, and transparency in AI systems through comprehensive model cards and standardized assessments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fadeIn" style={{animationDelay: '0.6s'}}>
              <Link href="/model-cards" className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded-lg text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                Explore Model Cards
              </Link>
              <Link href="/about" className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 font-bold py-3 px-6 rounded-lg text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                Learn More
              </Link>
            </div>
          </div>
          
          <div className="relative animate-fadeIn">
            <div className="relative group">
              {/* Main image with multiple animations */}
              <div className="relative animate-float">
                <img 
                  src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop&crop=center&q=80"
                  alt="AI Transparency and Ethics Visualization"
                  className="rounded-xl shadow-2xl w-full h-auto max-w-md mx-auto lg:max-w-none transform group-hover:scale-105 transition-all duration-500 animate-glow"
                />
                {/* Shimmer overlay effect */}
                <div className="absolute inset-0 rounded-xl animate-shimmer opacity-30"></div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-xl"></div>
              </div>
              
              {/* Animated decorative elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse-slow"></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full animate-pulse-slow" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-1/2 -right-6 w-2 h-2 bg-purple-400 rounded-full animate-pulse-slow" style={{animationDelay: '2s'}}></div>
            </div>
            
            {/* Enhanced floating cards with animations */}
            <div className="absolute -top-4 -right-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/20 animate-fadeIn animate-float" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow"></div>
                <div>
                  <div className="text-xs text-blue-200 mb-1">Fairness Score</div>
                  <div className="text-2xl font-bold text-white">94%</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/20 animate-fadeIn animate-float" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse-slow" style={{animationDelay: '0.5s'}}></div>
                <div>
                  <div className="text-xs text-blue-200 mb-1">Models Assessed</div>
                  <div className="text-2xl font-bold text-white">150+</div>
                </div>
              </div>
            </div>
            
            {/* Additional floating metric card */}
            <div className="absolute top-1/2 -right-8 bg-white/10 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-white/20 animate-fadeIn animate-float" style={{animationDelay: '0.6s'}}>
              <div className="text-center">
                <div className="text-xs text-blue-200 mb-1">Compliance Rate</div>
                <div className="text-xl font-bold text-white">98%</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 max-w-xl mx-auto text-center">
          <h3 className="text-lg font-semibold mb-3">Stay Updated</h3>
          <p className="mb-4 text-blue-100">Subscribe to our newsletter for the latest updates on AI transparency and fairness.</p>
          <form onSubmit={handleSubmit} className="flex max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-grow px-4 py-2 rounded-l-lg text-white border-2 border-white focus:outline-none focus:border-yellow-300 placeholder-gray-300 caret-white"
              required
            />
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-r-lg transition duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
    </section>
  );
}