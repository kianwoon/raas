'use client';

import { useState, useEffect } from 'react';
import { HeroSection } from '@/components/landing-page/HeroSection';
import { FeaturedModelCards } from '@/components/landing-page/FeaturedModelCards';
import { FairnessScorecards } from '@/components/landing-page/FairnessScorecards';
import { EducationalContentHub } from '@/components/landing-page/EducationalContentHub';
import { TransparencyMetricsDashboard } from '@/components/landing-page/TransparencyMetricsDashboard';
import { PersonaNavigation } from '@/components/landing-page/PersonaNavigation';
import { CallToAction } from '@/components/landing-page/CallToAction';
import { RecentReports } from '@/components/landing-page/RecentReports';
import { Footer } from '@/components/landing-page/Footer';
import { landingPageApi } from '@/lib/api/landing-page';

export default function Home() {
  const [modelCards, setModelCards] = useState<any[]>([]);
  const [fairnessDistribution, setFairnessDistribution] = useState<Record<string, number>>({});
  const [statistics, setStatistics] = useState<any>({});
  const [complianceFrameworks, setComplianceFrameworks] = useState<any[]>([]);
  const [educationalContent, setEducationalContent] = useState<any>({});
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use sample data for now, can be changed to use real data by setting use_sample_data to false
        const useSampleData = true;
        
        // Fetch all data in parallel
        const [
          modelCardsResponse,
          fairnessDistributionResponse,
          statisticsResponse,
          complianceFrameworksResponse,
          educationalContentResponse,
          recentReportsResponse
        ] = await Promise.all([
          landingPageApi.getFeaturedModelCards({ limit: 3, use_sample_data: useSampleData }),
          landingPageApi.getFairnessScoreDistribution({ use_sample_data: useSampleData }),
          landingPageApi.getModelCardStatistics({ use_sample_data: useSampleData }),
          landingPageApi.getComplianceFrameworks({ limit: 4, use_sample_data: useSampleData }),
          landingPageApi.getEducationalContent({ use_sample_data: useSampleData }),
          landingPageApi.getRecentReports({ limit: 4, use_sample_data: useSampleData })
        ]);
        
        setModelCards(modelCardsResponse);
        setFairnessDistribution(fairnessDistributionResponse);
        setStatistics(statisticsResponse);
        setComplianceFrameworks(complianceFrameworksResponse);
        setEducationalContent(educationalContentResponse);
        setRecentReports(recentReportsResponse);
      } catch (error) {
        console.error('Error fetching landing page data:', error);
        setError(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <HeroSection />
      
      <div className="container mx-auto px-4 py-12">
        <FeaturedModelCards modelCards={modelCards} />
        
        <div className="mt-16">
          <FairnessScorecards fairnessDistribution={fairnessDistribution} />
        </div>
        
        <div className="mt-16">
          <EducationalContentHub 
            complianceFrameworks={complianceFrameworks}
            educationalContent={educationalContent}
          />
        </div>
        
        <div className="mt-16">
          <TransparencyMetricsDashboard statistics={statistics} />
        </div>
        
        <div className="mt-16">
          <PersonaNavigation />
        </div>
        
        <div className="mt-16">
          <CallToAction />
        </div>
        
        <div className="mt-16">
          <RecentReports reports={recentReports} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
