'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResearchPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Research', count: 25 },
    { id: 'fairness', name: 'Fairness', count: 7 },
    { id: 'transparency', name: 'Transparency', count: 6 },
    { id: 'accountability', name: 'Accountability', count: 5 },
    { id: 'ethics', name: 'Ethics', count: 4 },
    { id: 'policy', name: 'Policy', count: 3 },
  ];

  const years = [
    { id: 'all', name: 'All Years' },
    { id: '2024', name: '2024' },
    { id: '2023', name: '2023' },
    { id: '2022', name: '2022' },
    { id: '2021', name: '2021' },
  ];

  const researchPapers = [
    {
      id: 1,
      title: 'Fairness in AI Systems: A Comprehensive Survey',
      description: 'A comprehensive survey of fairness definitions, metrics, and mitigation techniques in AI systems.',
      authors: ['Dr. Sarah Chen', 'Prof. Michael Wong', 'Dr. Aisha Patel'],
      category: 'fairness',
      year: '2024',
      type: 'survey',
      journal: 'ACM Computing Surveys',
      citations: 156,
      downloads: 2341,
      featured: true,
      tags: ['fairness', 'survey', 'metrics', 'mitigation'],
      abstract: 'This paper provides a comprehensive overview of fairness in AI systems, covering various definitions of fairness, metrics for measuring fairness, and techniques for mitigating bias. We analyze 200+ research papers and provide a structured framework for understanding fairness in different contexts.',
    },
    {
      id: 2,
      title: 'Explainable AI in Healthcare: Methods and Applications',
      description: 'Review of explainable AI techniques specifically tailored for healthcare applications.',
      authors: ['Dr. Lisa Zhang', 'Dr. James Wilson', 'Prof. Maria Garcia'],
      category: 'transparency',
      year: '2024',
      type: 'review',
      journal: 'Nature Machine Intelligence',
      citations: 89,
      downloads: 1876,
      tags: ['explainability', 'healthcare', 'review', 'applications'],
    },
    {
      id: 3,
      title: 'Algorithmic Bias in Financial Services: Detection and Mitigation',
      description: 'Analysis of bias in financial AI systems and proposed mitigation strategies.',
      authors: ['Prof. Robert Kim', 'Dr. Emily Johnson', 'Dr. David Brown'],
      category: 'fairness',
      year: '2024',
      type: 'research',
      journal: 'Journal of Financial Technology',
      citations: 67,
      downloads: 1456,
      featured: true,
      tags: ['bias', 'financial-services', 'mitigation', 'detection'],
    },
    {
      id: 4,
      title: 'Responsible AI Framework for Public Sector Applications',
      description: 'A comprehensive framework for implementing responsible AI in government and public sector.',
      authors: ['Dr. Amanda Lee', 'Prof. Christopher Taylor', 'Dr. Rachel Green'],
      category: 'policy',
      year: '2024',
      type: 'framework',
      journal: 'Government Information Quarterly',
      citations: 45,
      downloads: 1234,
      tags: ['responsible-ai', 'public-sector', 'framework', 'policy'],
    },
    {
      id: 5,
      title: 'Transparency in Deep Learning Models: A Multi-faceted Approach',
      description: 'Novel techniques for improving transparency in deep learning systems.',
      authors: ['Dr. Thomas Anderson', 'Dr. Jennifer White', 'Prof. Daniel Martinez'],
      category: 'transparency',
      year: '2024',
      type: 'research',
      journal: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
      citations: 78,
      downloads: 1654,
      tags: ['deep-learning', 'transparency', 'multi-faceted', 'techniques'],
    },
    {
      id: 6,
      title: 'Ethical Considerations in Autonomous Systems',
      description: 'Ethical frameworks and considerations for autonomous AI systems.',
      authors: ['Prof. Patricia Harris', 'Dr. Kevin Clark', 'Dr. Susan Lewis'],
      category: 'ethics',
      year: '2024',
      type: 'position-paper',
      journal: 'AI and Ethics Journal',
      citations: 34,
      downloads: 987,
      tags: ['ethics', 'autonomous-systems', 'framework', 'considerations'],
    },
    {
      id: 7,
      title: 'Fairness Metrics in Machine Learning: A Comparative Analysis',
      description: 'Comparative analysis of different fairness metrics and their applicability.',
      authors: ['Dr. Mark Robinson', 'Dr. Nancy Walker', 'Prof. George Hall'],
      category: 'fairness',
      year: '2023',
      type: 'research',
      journal: 'Journal of Machine Learning Research',
      citations: 112,
      downloads: 2890,
      tags: ['fairness-metrics', 'comparative-analysis', 'machine-learning'],
    },
    {
      id: 8,
      title: 'Accountability in AI Systems: Legal and Technical Perspectives',
      description: 'Analysis of accountability mechanisms from both legal and technical viewpoints.',
      authors: ['Prof. Laura Young', 'Dr. Brian King', 'Dr. Michelle Scott'],
      category: 'accountability',
      year: '2023',
      type: 'research',
      journal: 'Harvard Journal of Law & Technology',
      citations: 89,
      downloads: 1567,
      featured: true,
      tags: ['accountability', 'legal', 'technical', 'perspectives'],
    },
    {
      id: 9,
      title: 'Bias Detection in Natural Language Processing Models',
      description: 'Techniques for detecting and mitigating bias in NLP systems.',
      authors: ['Dr. Jason Adams', 'Dr. Stephanie Baker', 'Prof. Frank Nelson'],
      category: 'fairness',
      year: '2023',
      type: 'research',
      journal: 'Computational Linguistics',
      citations: 134,
      downloads: 3123,
      tags: ['bias-detection', 'nlp', 'mitigation', 'models'],
    },
    {
      id: 10,
      title: 'Model Cards for Transparent AI Reporting',
      description: 'Framework for creating comprehensive model cards for AI transparency.',
      authors: ['Dr. Margaret Hill', 'Prof. Paul Carter', 'Dr. Anna Wright'],
      category: 'transparency',
      year: '2023',
      type: 'framework',
      journal: 'Communications of the ACM',
      citations: 178,
      downloads: 4567,
      tags: ['model-cards', 'transparency', 'reporting', 'framework'],
    },
    {
      id: 11,
      title: 'Ethical AI in Autonomous Vehicles: Challenges and Solutions',
      description: 'Ethical challenges and proposed solutions for autonomous vehicle AI.',
      authors: ['Dr. Christopher Evans', 'Prof. Deborah Perez', 'Dr. Ronald Thompson'],
      category: 'ethics',
      year: '2023',
      type: 'research',
      journal: 'Transportation Research Part C',
      citations: 56,
      downloads: 1234,
      tags: ['autonomous-vehicles', 'ethics', 'challenges', 'solutions'],
    },
    {
      id: 12,
      title: 'Policy Implications of AI in Healthcare',
      description: 'Analysis of policy implications for AI adoption in healthcare systems.',
      authors: ['Prof. Sandra Turner', 'Dr. Kenneth Phillips', 'Dr. Donna Campbell'],
      category: 'policy',
      year: '2023',
      type: 'policy-analysis',
      journal: 'Health Affairs',
      citations: 45,
      downloads: 876,
      tags: ['policy', 'healthcare', 'implications', 'adoption'],
    },
    {
      id: 13,
      title: 'Fairness in Recommender Systems: A Survey',
      description: 'Comprehensive survey of fairness issues in recommender systems.',
      authors: ['Dr. Carolyn Parker', 'Prof. Joshua Ross', 'Dr. Beverly Russell'],
      category: 'fairness',
      year: '2023',
      type: 'survey',
      journal: 'ACM Transactions on Information Systems',
      citations: 98,
      downloads: 2345,
      tags: ['recommender-systems', 'fairness', 'survey', 'comprehensive'],
    },
    {
      id: 14,
      title: 'Transparency in AI Decision-Making: A User Study',
      description: 'User study on the importance of transparency in AI decision-making.',
      authors: ['Dr. Jeffrey Howard', 'Dr. Kathy Watson', 'Prof. Jerry Coleman'],
      category: 'transparency',
      year: '2023',
      type: 'user-study',
      journal: 'CHI Conference on Human Factors in Computing Systems',
      citations: 67,
      downloads: 1543,
      tags: ['transparency', 'decision-making', 'user-study', 'importance'],
    },
    {
      id: 15,
      title: 'Accountability Frameworks for AI Systems',
      description: 'Comparative analysis of accountability frameworks for AI systems.',
      authors: ['Prof. Shirley Hernandez', 'Dr. Eric Morgan', 'Dr. Jacqueline Cooper'],
      category: 'accountability',
      year: '2023',
      type: 'framework',
      journal: 'Science and Engineering Ethics',
      citations: 78,
      downloads: 1876,
      tags: ['accountability', 'frameworks', 'comparative-analysis', 'systems'],
    },
    {
      id: 16,
      title: 'Cross-Cultural Ethical AI Development',
      description: 'Cross-cultural perspectives on ethical AI development practices.',
      authors: ['Dr. Maria Flores', 'Prof. Stephen Barnes', 'Dr. Lisa Nelson'],
      category: 'ethics',
      year: '2023',
      type: 'research',
      journal: 'AI and Society',
      citations: 45,
      downloads: 1098,
      tags: ['cross-cultural', 'ethics', 'development', 'perspectives'],
    },
    {
      id: 17,
      title: 'AI Policy Development in Southeast Asia',
      description: 'Analysis of AI policy development across Southeast Asian countries.',
      authors: ['Dr. Robert Bryant', 'Prof. Marie Alexander', 'Dr. Victoria Richardson'],
      category: 'policy',
      year: '2023',
      type: 'policy-analysis',
      journal: 'Telecommunications Policy',
      citations: 34,
      downloads: 765,
      tags: ['ai-policy', 'southeast-asia', 'development', 'analysis'],
    },
    {
      id: 18,
      title: 'Fairness in Federated Learning Systems',
      description: 'Challenges and solutions for fairness in federated learning.',
      authors: ['Dr. Kevin Griffin', 'Dr. Pamela Diaz', 'Prof. Wayne Murray'],
      category: 'fairness',
      year: '2022',
      type: 'research',
      journal: 'IEEE Transactions on Services Computing',
      citations: 89,
      downloads: 2134,
      tags: ['federated-learning', 'fairness', 'challenges', 'solutions'],
    },
    {
      id: 19,
      title: 'Explainable AI for Credit Scoring',
      description: 'Techniques for explainable AI in credit scoring systems.',
      authors: ['Dr. Jeremy Coleman', 'Prof. Cynthia Barnes', 'Dr. Ralph Rivera'],
      category: 'transparency',
      year: '2022',
      type: 'research',
      journal: 'Expert Systems with Applications',
      citations: 123,
      downloads: 2765,
      tags: ['explainable-ai', 'credit-scoring', 'techniques', 'systems'],
    },
    {
      id: 20,
      title: 'Legal Accountability in AI Systems',
      description: 'Legal frameworks for accountability in AI systems.',
      authors: ['Prof. Diane Cooper', 'Dr. Nicholas Reed', 'Dr. Martha Mitchell'],
      category: 'accountability',
      year: '2022',
      type: 'legal-analysis',
      journal: 'Law, Innovation and Technology',
      citations: 67,
      downloads: 1456,
      tags: ['legal', 'accountability', 'frameworks', 'systems'],
    },
    {
      id: 21,
      title: 'Ethical Guidelines for AI Research',
      description: 'Comprehensive ethical guidelines for AI research practices.',
      authors: ['Dr. Virginia Howard', 'Prof. Jack Torres', 'Dr. Carolyn Butler'],
      category: 'ethics',
      year: '2022',
      type: 'guidelines',
      journal: 'AI Ethics Journal',
      citations: 89,
      downloads: 1987,
      tags: ['ethical-guidelines', 'ai-research', 'practices', 'comprehensive'],
    },
    {
      id: 22,
      title: 'Global AI Policy Landscape',
      description: 'Overview of AI policy developments globally.',
      authors: ['Dr. Scott Price', 'Prof. Rachel Sanchez', 'Dr. Benjamin Morris'],
      category: 'policy',
      year: '2022',
      type: 'landscape-analysis',
      journal: 'Global Policy',
      citations: 45,
      downloads: 1098,
      tags: ['global', 'ai-policy', 'landscape', 'overview'],
    },
    {
      id: 23,
      title: 'Fairness in Computer Vision Systems',
      description: 'Analysis of fairness issues in computer vision applications.',
      authors: ['Dr. Samuel Rogers', 'Dr. Heather Simmons', 'Prof. Raymond Foster'],
      category: 'fairness',
      year: '2022',
      type: 'research',
      journal: 'Computer Vision and Image Understanding',
      citations: 156,
      downloads: 3210,
      tags: ['computer-vision', 'fairness', 'analysis', 'applications'],
    },
    {
      id: 24,
      title: 'Transparency in AI Supply Chains',
      description: 'Transparency considerations in AI supply chain management.',
      authors: ['Dr. Marilyn Ward', 'Prof. Louis Chavez', 'Dr. Frances Bryant'],
      category: 'transparency',
      year: '2022',
      type: 'research',
      journal: 'Supply Chain Management',
      citations: 34,
      downloads: 876,
      tags: ['transparency', 'ai-supply-chain', 'considerations', 'management'],
    },
    {
      id: 25,
      title: 'Corporate Accountability for AI Systems',
      description: 'Corporate governance frameworks for AI accountability.',
      authors: ['Prof. Joshua Griffin', 'Dr. Judy Flores', 'Dr. Eugene Coleman'],
      category: 'accountability',
      year: '2021',
      type: 'framework',
      journal: 'Business Ethics Quarterly',
      citations: 78,
      downloads: 1543,
      tags: ['corporate', 'accountability', 'governance', 'frameworks'],
    },
  ];

  const filteredResearch = researchPapers.filter(paper => {
    const matchesCategory = selectedCategory === 'all' || paper.category === selectedCategory;
    const matchesYear = selectedYear === 'all' || paper.year === selectedYear;
    const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         paper.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         paper.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         paper.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesYear && matchesSearch;
  });

  const featuredResearch = researchPapers.filter(paper => paper.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Research Papers</h1>
            <p className="text-xl text-indigo-100 mb-8">
              Cutting-edge research on AI fairness, transparency, accountability, and ethics from leading experts worldwide
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500 px-3 py-1 rounded-full">25 Papers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500 px-3 py-1 rounded-full">5 Categories</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500 px-3 py-1 rounded-full">50K+ Citations</span>
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
                  placeholder="Search papers, authors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {years.map((year) => (
                <button
                  key={year.id}
                  onClick={() => setSelectedYear(year.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedYear === year.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {year.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Research */}
      {searchQuery === '' && selectedCategory === 'all' && selectedYear === 'all' && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Research</h2>
              <div className="space-y-8">
                {featuredResearch.map((paper) => (
                  <div key={paper.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Featured
                            </span>
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {paper.category}
                            </span>
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {paper.year}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{paper.title}</h3>
                          <p className="text-gray-600 mb-4">{paper.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Authors:</span> {paper.authors.join(', ')}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Journal:</span> {paper.journal}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {paper.abstract && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Abstract</h4>
                          <p className="text-gray-600">{paper.abstract}</p>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-indigo-600">{paper.citations}</div>
                          <div className="text-sm text-gray-600">Citations</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-indigo-600">{paper.downloads}</div>
                          <div className="text-sm text-gray-600">Downloads</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <div className="text-lg font-bold text-indigo-600">{paper.type}</div>
                          <div className="text-sm text-gray-600">Type</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {paper.tags.map((tag) => (
                            <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                            Download PDF
                          </button>
                          <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-300">
                            Cite
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Research Papers */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'All Research Papers' : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <span className="text-gray-600">
                {filteredResearch.length} paper{filteredResearch.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {filteredResearch.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No papers found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredResearch.map((paper) => (
                  <div key={paper.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {paper.category}
                          </span>
                          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {paper.year}
                          </span>
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {paper.type}
                          </span>
                          {paper.featured && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{paper.title}</h3>
                        <p className="text-gray-600 mb-4">{paper.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Authors:</span> {paper.authors.slice(0, 2).join(', ')}
                            {paper.authors.length > 2 && ` +${paper.authors.length - 2} more`}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Journal:</span> {paper.journal}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Citations:</span> {paper.citations}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Downloads:</span> {paper.downloads}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {paper.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                          Download PDF
                        </button>
                        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-300">
                          View Abstract
                        </button>
                        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-300">
                          Cite
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Research Statistics Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Research Impact</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">25K+</div>
                <div className="text-gray-600">Total Citations</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">75K+</div>
                <div className="text-gray-600">Total Downloads</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">50+</div>
                <div className="text-gray-600">Research Institutions</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">15+</div>
                <div className="text-gray-600">Countries Represented</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submit Research Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Submit Your Research</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Share your research on AI fairness, transparency, accountability, and ethics with our community
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-8 rounded-lg transition duration-300">
                Submit Paper
              </button>
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