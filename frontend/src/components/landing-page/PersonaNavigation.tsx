'use client';

import Link from 'next/link';

interface Persona {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  link: string;
}

export function PersonaNavigation() {
  const personas: Persona[] = [
    {
      id: 'developers',
      name: 'AI Developers',
      description: 'Tools and resources for creating transparent and fair AI models',
      icon: '👨‍💻',
      features: [
        'Model card templates',
        'Fairness testing tools',
        'Implementation guides'
      ],
      link: '/resources/developers'
    },
    {
      id: 'business',
      name: 'Business Leaders',
      description: 'Understanding AI governance and its impact on business outcomes',
      icon: '👔',
      features: [
        'ROI of transparency',
        'Risk management frameworks',
        'Compliance tracking'
      ],
      link: '/resources/business'
    },
    {
      id: 'regulators',
      name: 'Regulators & Policymakers',
      description: 'Resources for developing and implementing AI governance frameworks',
      icon: '🏛️',
      features: [
        'Policy recommendations',
        'Regulatory compliance',
        'International standards'
      ],
      link: '/resources/regulators'
    },
    {
      id: 'public',
      name: 'General Public',
      description: 'Understanding how AI systems work and their impact on society',
      icon: '👥',
      features: [
        'AI literacy resources',
        'Transparency explanations',
        'Public consultation tools'
      ],
      link: '/resources/public'
    }
  ];

  return (
    <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Resources For Your Role</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find tailored resources and tools based on your specific role and interests in AI transparency.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {personas.map((persona) => (
          <div key={persona.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
            <div className="text-4xl mb-4">{persona.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{persona.name}</h3>
            <p className="text-gray-600 mb-4">{persona.description}</p>
            
            <ul className="space-y-2 mb-6">
              {persona.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Link 
              href={persona.link}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Explore Resources →
            </Link>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-blue-50 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Join Our Community</h3>
            <p className="text-blue-700 max-w-2xl">
              Connect with experts, policymakers, and practitioners working to advance AI transparency and fairness.
            </p>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 whitespace-nowrap">
            Join Community
          </button>
        </div>
      </div>
    </section>
  );
}