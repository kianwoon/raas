import Link from 'next/link';

export default function EducationalContent() {
  const resources = [
    {
      title: "Understanding AI Fairness",
      description: "Learn about the key concepts and metrics used to evaluate fairness in AI systems.",
      category: "Guide",
      link: "/resources/ai-fairness",
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Model Card Frameworks",
      description: "Explore different frameworks and standards for creating comprehensive model cards.",
      category: "Framework",
      link: "/resources/model-card-frameworks",
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "Compliance Standards for AI",
      description: "Understand the regulatory landscape and compliance requirements for AI systems.",
      category: "Regulation",
      link: "/resources/compliance-standards",
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Fairness Assessment Tools",
      description: "Discover tools and methodologies for assessing fairness in AI models.",
      category: "Tools",
      link: "/resources/fairness-tools",
      color: "bg-yellow-100 text-yellow-800"
    }
  ];

  const useCases = [
    {
      title: "Financial Services",
      description: "How fairness metrics are applied in credit scoring and fraud detection systems.",
      icon: "💰"
    },
    {
      title: "Healthcare AI",
      description: "Ensuring equitable outcomes in diagnostic and treatment recommendation systems.",
      icon: "🏥"
    },
    {
      title: "Hiring and Recruitment",
      description: "Addressing bias in AI-powered resume screening and candidate evaluation tools.",
      icon: "👥"
    },
    {
      title: "Criminal Justice",
      description: "Fairness considerations in risk assessment and predictive policing models.",
      icon: "⚖️"
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Educational Resources
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Learn about responsible AI practices, fairness metrics, and transparency frameworks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Resources Section */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Resources</h3>
            <div className="space-y-6">
              {resources.map((resource, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{resource.title}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resource.color}`}>
                      {resource.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  <Link href={resource.link} className="text-blue-600 hover:text-blue-800 font-medium">
                    Learn more →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases Section */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Industry Use Cases</h3>
            <div className="space-y-6">
              {useCases.map((useCase, index) => (
                <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start">
                    <div className="text-3xl mr-4">{useCase.icon}</div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{useCase.title}</h4>
                      <p className="text-gray-600">{useCase.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link 
            href="/resources"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition duration-300"
          >
            View All Resources
          </Link>
        </div>
      </div>
    </section>
  );
}