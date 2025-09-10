'use client';

import Link from 'next/link';
import { useState } from 'react';

export function CallToAction() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
    setEmail('');
    setIsSubmitted(true);
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-md p-8 md:p-12 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your AI Transparency Journey Today</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join organizations across Singapore and beyond who are committed to building transparent and fair AI systems.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link 
            href="/model-cards/create"
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg text-center transition duration-300"
          >
            Create Your First Model Card
          </Link>
          <Link 
            href="/contact"
            className="bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 font-bold py-3 px-8 rounded-lg text-center transition duration-300"
          >
            Schedule a Demo
          </Link>
        </div>
        
        <div className="bg-blue-800 bg-opacity-50 rounded-xl p-6 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold mb-4">Stay Updated on AI Transparency</h3>
          
          {isSubmitted ? (
            <div className="bg-green-500 text-white py-3 px-4 rounded-lg mb-4">
              Thank you for subscribing! Check your email for confirmation.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-300 border-2 border-white placeholder-gray-300 caret-white"
                required
              />
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg transition duration-300 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          )}
          
          <p className="text-blue-200 text-sm mt-3">
            Get the latest updates on AI transparency, fairness metrics, and regulatory developments.
          </p>
        </div>
      </div>
    </section>
  );
}