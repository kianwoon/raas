'use client';

import Link from 'next/link';

interface Report {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  link: string;
}

interface RecentReportsProps {
  reports: Report[];
}

export function RecentReports({ reports }: RecentReportsProps) {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'industry report':
        return 'bg-blue-100 text-blue-800';
      case 'analysis':
        return 'bg-purple-100 text-purple-800';
      case 'case study':
        return 'bg-green-100 text-green-800';
      case 'best practices':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Reports & Research</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay informed with the latest research, case studies, and industry reports on AI transparency and fairness.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(report.category)}`}>
                {report.category}
              </span>
              <span className="text-sm text-gray-500">{report.date}</span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">{report.title}</h3>
            <p className="text-gray-600 mb-5 line-clamp-3">{report.description}</p>
            
            <Link 
              href={report.link}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Read Report →
            </Link>
          </div>
        ))}
      </div>
      
      <div className="mt-10 bg-blue-50 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Research Partnership</h3>
            <p className="text-blue-700 max-w-2xl">
              Interested in collaborating on research or publishing your work on our platform? We welcome partnerships with academia, industry, and government.
            </p>
          </div>
          
          <Link 
            href="/contact"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 whitespace-nowrap"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}