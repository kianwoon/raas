'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { storeAuthTokens, storeUserData } from '@/lib/auth';

export default function AuthSuccessPage() {
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const handleSuccess = async () => {
      try {
        // Get tokens from URL parameters
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const picture = searchParams.get('picture');
        
        if (!accessToken || !refreshToken) {
          setError('Missing authentication tokens');
          setStatus('error');
          return;
        }
        
        // Store authentication state
        storeAuthTokens({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        storeUserData({
          email,
          name,
          picture
        });
        
        // Dispatch event to update UI components
        window.dispatchEvent(new Event('authStateChange'));
        
        setStatus('success');
        
        // Redirect to home page after successful authentication
        setTimeout(() => {
          router.push('/');
        }, 2000);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
      }
    };
    
    handleSuccess();
  }, [searchParams, router]);
  
  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Processing authentication...</h2>
          <p className="text-gray-600">Please wait while we complete your sign-in.</p>
        </div>
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Successfully Signed In!</h2>
          <p className="text-gray-600 mb-6">Welcome back! You'll be redirected to the home page shortly.</p>
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}