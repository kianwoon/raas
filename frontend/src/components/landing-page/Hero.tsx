import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-500 opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-indigo-500 opacity-20"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Responsible AI <span className="text-yellow-300">Transparency</span> Platform
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl">
              Promoting fairness, accountability, and transparency in AI systems through comprehensive model cards and governance tools.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link href="/model-cards" className="px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition duration-300 shadow-lg">
                Explore Model Cards
              </Link>
              <Link href="/about" className="px-8 py-3 bg-transparent text-white font-bold rounded-lg border-2 border-white hover:bg-white hover:text-gray-900 transition duration-300">
                Learn More
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white border-opacity-20">
              <div className="aspect-w-16 aspect-h-9">
                <div className="bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl h-64 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-5xl font-bold mb-2">92%</div>
                    <div className="text-xl">Average Fairness Score</div>
                    <div className="mt-4 text-sm opacity-80">Across 150+ AI Models</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">150+</div>
                  <div className="text-sm text-blue-100">Model Cards</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">12</div>
                  <div className="text-sm text-blue-100">Compliance Frameworks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">8</div>
                  <div className="text-sm text-blue-100">Industry Domains</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}