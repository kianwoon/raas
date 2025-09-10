'use client';

import Link from 'next/link';

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  authority: string;
  industry: string;
}

interface EducationalContent {
  guides: Array<{
    id: string;
    title: string;
    description: string;
    reading_time: string;
    difficulty: string;
    link: string;
  }>;
  tutorials: Array<{
    id: string;
    title: string;
    description: string;
    duration: string;
    link: string;
  }>;
  use_cases: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    link: string;
  }>;
}

interface EducationalContentHubProps {
  complianceFrameworks: ComplianceFramework[];
  educationalContent: EducationalContent;
}

export function EducationalContentHub({ 
  complianceFrameworks, 
  educationalContent 
}: EducationalContentHubProps) {
  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Educational Content Hub</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Access resources to help you understand and implement AI transparency, fairness, and compliance practices.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compliance Frameworks */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Compliance Frameworks</h3>
          <p className="text-gray-600 mb-6">
            Explore frameworks that help ensure AI systems meet regulatory and ethical standards.
          </p>
          
          <div className="space-y-4">
            {complianceFrameworks.map((framework) => (
              <div key={framework.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">{framework.name}</h4>
                    <p className="text-sm text-gray-500">v{framework.version} • {framework.authority}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {framework.industry}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{framework.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              href="/compliance-frameworks"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Frameworks →
            </Link>
          </div>
        </div>
        
        {/* Educational Resources */}
        <div className="space-y-8">
          {/* Guides */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Guides</h3>
            <div className="space-y-4">
              {educationalContent.guides.map((guide) => (
                <div key={guide.id} className="border-l-4 border-blue-500 pl-4 py-1">
                  <h4 className="font-bold text-gray-900">{guide.title}</h4>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{guide.description}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <span>{guide.reading_time}</span>
                    <span className="mx-2">•</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{guide.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tutorials */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tutorials</h3>
            <div className="space-y-4">
              {educationalContent.tutorials.map((tutorial) => (
                <div key={tutorial.id} className="border-l-4 border-green-500 pl-4 py-1">
                  <h4 className="font-bold text-gray-900">{tutorial.title}</h4>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{tutorial.description}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <span>{tutorial.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Use Cases */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Use Cases</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {educationalContent.use_cases.map((useCase) => (
                <div key={useCase.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="text-2xl mb-2">{useCase.icon}</div>
                  <h4 className="font-bold text-gray-900">{useCase.title}</h4>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}