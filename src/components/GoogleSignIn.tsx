'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import GoogleScriptLoader from '../utils/googleScriptLoader';

// Updated interfaces to match your backend
interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'worker';
  picture?: string;
  authMethod: 'local' | 'google';
  isNewUser: boolean;
}

interface BackendFarm {
  id: string;
  name: string;
  slug: string;
  plan: 'basic' | 'standard' | 'premium';
}

interface GoogleSignInProps {
  onSuccess?: (user: BackendUser, farm?: BackendFarm) => void;
  onError?: (error: string) => void;
  // Optional farm setup for new users
  enableFarmSetup?: boolean;
  defaultFarmName?: string;
  defaultPlan?: 'basic' | 'standard' | 'premium';
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

/**
 * Google Sign-In Component
 * Handles Google authentication using the Google Identity Services SDK
 * Integrates with your backend to create/authenticate users
 */
export default function GoogleSignIn({ 
  onSuccess, 
  onError, 
  enableFarmSetup = false,
  defaultFarmName = '',
  defaultPlan = 'basic'
}: GoogleSignInProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { login } = useGoogleAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isBrowser, setIsBrowser] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Farm setup state for new users
  const [showFarmSetup, setShowFarmSetup] = useState(false);
  const [farmName, setFarmName] = useState(defaultFarmName);
  const [plan, setPlan] = useState<'basic' | 'standard' | 'premium'>(defaultPlan);
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);

  const addDebugInfo = (info: string) => {
    console.log('GoogleSignIn Debug:', info);
    setDebugInfo(prev => [...prev, info]);
  };

  useEffect(() => {
    setIsBrowser(true);
    addDebugInfo('Component mounted');
    
    // Use the singleton script loader to prevent duplicate script loading
    const scriptLoader = GoogleScriptLoader.getInstance();
    
    scriptLoader.loadScript()
      .then(() => {
        addDebugInfo('Google script loaded successfully');
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
          initializeGoogleSignIn();
        }, 100);
      })
      .catch((err) => {
        addDebugInfo(`Failed to load Google script: ${err}`);
        setError('Failed to load Google authentication script');
      });

    // No cleanup function needed - the singleton handles everything
    return () => {
      addDebugInfo('Component unmounting, no cleanup needed');
    };
  }, []);

  /**
   * Initialize Google Sign-In with the Identity Services SDK
   */
  const initializeGoogleSignIn = () => {
    addDebugInfo('Initializing Google Sign-In');
    
    // Multiple safety checks
    if (typeof window === 'undefined') {
      addDebugInfo('Window is not available (SSR)');
      return;
    }

    if (!window.google) {
      addDebugInfo('Window.google is not available');
      setError('Google SDK not loaded');
      return;
    }

    if (!window.google.accounts?.id) {
      addDebugInfo('Google accounts.id is not available');
      setError('Google Identity Services not loaded');
      return;
    }

    if (!buttonRef.current) {
      addDebugInfo('Button ref is not available');
      setError('Button element not ready');
      return;
    }

    if (isInitialized) {
      addDebugInfo('Already initialized, skipping');
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
    addDebugInfo(`Client ID check: ${clientId ? 'Available' : 'Missing'}`);
    
    if (!clientId) {
      addDebugInfo('Google OAuth Client ID not configured');
      setError('Google OAuth Client ID not configured');
      return;
    }

    try {
      addDebugInfo('Calling google.accounts.id.initialize');
      // Initialize Google Sign-In with your OAuth Client ID
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      addDebugInfo('Calling google.accounts.id.renderButton');
      
      // Safely clear the button container
      if (buttonRef.current && buttonRef.current.parentNode) {
        try {
          buttonRef.current.innerHTML = '';
        } catch (clearError) {
          addDebugInfo(`Warning: Could not clear button container: ${clearError}`);
        }
      }
      
      // Render the Google Sign-In button with custom styling
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 300,
      });
      
      setIsInitialized(true);
      addDebugInfo('Google Sign-In button rendered successfully');
    } catch (err) {
      addDebugInfo(`Error initializing Google Sign-In: ${err}`);
      console.error('Error initializing Google Sign-In:', err);
      setError('Failed to initialize Google Sign-In');
    }
  };

  /**
   * Handle the Google credential response
   * This function is called when the user successfully signs in with Google
   */
  const handleCredentialResponse = async (response: any) => {
    try {
      setIsLoading(true);
      setError(null);
      addDebugInfo('Received credential response from Google');

      // Extract the ID token from the Google response
      const idToken = response.credential;

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }
      // Save ID token to support follow-up farm setup
      setPendingIdToken(idToken);

      addDebugInfo('Sending ID token to backend');
      
      // Prepare the request body for your backend
      const requestBody: any = { token: idToken };
      
      // If farm setup is enabled and we have farm details, include them
      if (enableFarmSetup && farmName) {
        requestBody.farmName = farmName;
        requestBody.plan = plan;
      }

      // Send the ID token to frontend API route which sets cookie and proxies to backend
      const backendResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      const data = await backendResponse.json();
      addDebugInfo(`Backend response: ${backendResponse.status} ${backendResponse.statusText}`);

      if (!backendResponse.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      addDebugInfo('Authentication successful, calling login function');
      
      // Use the hook to manage authentication state
      // Pass user, token, and farm information
      login(data.user, data.token, data.farm);

      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(data.user, data.farm);
      }

      // Handle user flow based on whether they're new or existing
      if (data.user.isNewUser) {
        addDebugInfo('New user detected');
        
        if (data.farm) {
          // User has a farm, redirect to dashboard
          addDebugInfo('User has farm, redirecting to dashboard');
          router.push(`/${data.farm.slug}/dashboard`);
        } else {
          // User needs to set up farm
          addDebugInfo('User needs farm setup');
          if (enableFarmSetup) {
            setShowFarmSetup(true);
          } else {
            router.push('/setup-profile');
          }
        }
      } else {
        addDebugInfo('Existing user, redirecting to dashboard');
        // For existing users, redirect to their farm dashboard
        if (data.farm) {
          router.push(`/${data.farm.slug}/dashboard`);
        } else {
          router.push('/dashboard');
        }
      }

    } catch (err) {
      addDebugInfo(`Authentication error: ${err}`);
      console.error('Google Sign-In error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle farm setup form submission
   */
  const handleFarmSetup = async () => {
    if (!farmName.trim()) {
      setError('Farm name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (!pendingIdToken) {
        throw new Error('Google authentication not available. Please sign in again.');
      }

      // Reuse the Google auth route with farm details to create the farm
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token: pendingIdToken, farmName, plan }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Farm setup failed');
      }

      // Persist and redirect
      if (data.user && data.token) {
        login(data.user, data.token, data.farm);
      }
      if (data.farm) {
        localStorage.setItem('farm_info', JSON.stringify(data.farm));
      }
      router.push(`/${data.farm.slug}/dashboard`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Farm setup failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Debug Information - Only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs">
          <p className="font-medium text-blue-800 mb-2">Debug Info:</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-blue-700">{info}</div>
            ))}
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Farm Setup Form for New Users */}
      {showFarmSetup && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Complete Your Farm Setup</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="farmName" className="block text-sm font-medium text-gray-700">
                Farm Name
              </label>
              <input
                type="text"
                id="farmName"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your farm name"
              />
            </div>
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
                Subscription Plan
              </label>
              <select
                id="plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value as 'basic' | 'standard' | 'premium')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <button
              onClick={handleFarmSetup}
              disabled={isLoading || !farmName.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      )}
      
      {/* Google Sign-In Button Container */}
      <div ref={buttonRef} className="flex justify-center min-h-[40px] border border-gray-200 rounded-md p-2">
        {/* Google Sign-In button will be rendered here by the SDK */}
        {isBrowser && !window.google && (
          <div className="text-gray-500 text-sm">
            Loading Google Sign-In...
          </div>
        )}
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="text-center text-gray-600">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Authenticating...
        </div>
      )}
    </div>
  );
}
