# Google Authentication Frontend Integration

This document explains how to use the Google Sign-In components and hooks in your React frontend application.

## 🚀 **Quick Start**

### **1. Environment Setup**

Create a `.env.local` file in your frontend directory:

```bash
# Google OAuth Client ID
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id-here

# Backend URL (adjust port if needed)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

### **2. Basic Usage**

```tsx
import GoogleSignIn from '../components/GoogleSignIn';

function LoginPage() {
  const handleSuccess = (user, farm) => {
    console.log('User signed in:', user);
    console.log('Farm details:', farm);
  };

  const handleError = (error) => {
    console.error('Sign-in failed:', error);
  };

  return (
    <div>
      <h1>Sign In</h1>
      <GoogleSignIn
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}
```

## 🔧 **Components Overview**

### **GoogleSignIn Component**

The main component that handles Google authentication.

#### **Props**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSuccess` | `(user, farm?) => void` | - | Callback when authentication succeeds |
| `onError` | `(error: string) => void` | - | Callback when authentication fails |
| `enableFarmSetup` | `boolean` | `false` | Enable farm setup during sign-in |
| `defaultFarmName` | `string` | `''` | Default farm name for new users |
| `defaultPlan` | `'basic' \| 'standard' \| 'premium'` | `'basic'` | Default subscription plan |

#### **Basic Example**

```tsx
<GoogleSignIn
  onSuccess={(user, farm) => {
    // Handle successful authentication
    if (farm) {
      router.push(`/${farm.slug}/dashboard`);
    } else {
      router.push('/setup-profile');
    }
  }}
  onError={(error) => {
    // Handle authentication errors
    setErrorMessage(error);
  }}
/>
```

#### **With Farm Setup**

```tsx
<GoogleSignIn
  enableFarmSetup={true}
  defaultFarmName="My Farm"
  defaultPlan="standard"
  onSuccess={(user, farm) => {
    // User and farm are created together
    router.push(`/${farm.slug}/dashboard`);
  }}
/>
```

### **UserInfoCard Component**

Displays user information after successful authentication.

```tsx
import UserInfoCard from '../components/UserInfoCard';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <UserInfoCard />
    </div>
  );
}
```

### **useGoogleAuth Hook**

Manages authentication state and provides utility functions.

```tsx
import { useGoogleAuth } from '../hooks/useGoogleAuth';

function MyComponent() {
  const {
    isAuthenticated,
    user,
    farm,
    token,
    isLoading,
    login,
    logout,
    getAuthHeaders,
    hasRole,
    isOwner,
    isNewUser
  } = useGoogleAuth();

  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) return <div>Please sign in</div>;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Role: {user.role}</p>
      {farm && <p>Farm: {farm.name}</p>}
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

## 📱 **Integration Examples**

### **Login Page**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import GoogleSignIn from '../components/GoogleSignIn';

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = (user, farm) => {
    if (user.isNewUser && !farm) {
      // New user without farm - redirect to setup
      router.push('/setup-profile');
    } else if (farm) {
      // User has farm - redirect to dashboard
      router.push(`/${farm.slug}/dashboard`);
    } else {
      // Existing user without farm
      router.push('/dashboard');
    }
  };

  const handleError = (error) => {
    // Handle errors (show toast, set error state, etc.)
    console.error('Authentication failed:', error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        <GoogleSignIn
          onSuccess={handleSuccess}
          onError={handleError}
        />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Or{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-500">
              create a new account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

### **Registration Page with Google Option**

```tsx
'use client';

import { useState } from 'react';
import GoogleSignIn from '../components/GoogleSignIn';

export default function RegisterPage() {
  const [farmName, setFarmName] = useState('');
  const [plan, setPlan] = useState<'basic' | 'standard' | 'premium'>('basic');

  const handleGoogleSuccess = (user, farm) => {
    if (farm) {
      // User created with farm
      router.push(`/${farm.slug}/dashboard`);
    } else {
      // User created without farm
      router.push('/setup-profile');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        {/* Google Sign-In with Farm Setup */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Quick Start with Google</h3>
          
          <div className="space-y-3">
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="Farm Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="basic">Basic Plan</option>
              <option value="standard">Standard Plan</option>
              <option value="premium">Premium Plan</option>
            </select>
          </div>

          <GoogleSignIn
            enableFarmSetup={true}
            defaultFarmName={farmName}
            defaultPlan={plan}
            onSuccess={handleGoogleSuccess}
            onError={(error) => console.error(error)}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Traditional registration form */}
        <form className="space-y-4">
          {/* Your existing registration form fields */}
        </form>
      </div>
    </div>
  );
}
```

### **Protected Route Component**

```tsx
'use client';

import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'owner' | 'manager' | 'worker';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useGoogleAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

### **Dashboard with User Info**

```tsx
'use client';

import { useGoogleAuth } from '../hooks/useGoogleAuth';
import UserInfoCard from '../components/UserInfoCard';

export default function Dashboard() {
  const { user, farm, logout } = useGoogleAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              {farm ? `${farm.name} Dashboard` : 'Dashboard'}
            </h1>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <UserInfoCard />
          
          {/* Your dashboard content */}
        </div>
      </main>
    </div>
  );
}
```

## 🔐 **Authentication Flow**

### **1. User Clicks Google Sign-In**
- Google Identity Services SDK handles the OAuth flow
- User authenticates with Google
- Google returns an ID token

### **2. Frontend Sends Token to Backend**
```tsx
const response = await fetch('http://localhost:5001/api/auth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    token: idToken,
    farmName: 'My Farm', // Optional
    plan: 'basic'         // Optional
  })
});
```

### **3. Backend Processes Authentication**
- Verifies Google ID token
- Creates/updates user in database
- Creates farm if requested
- Returns JWT and user profile

### **4. Frontend Stores Authentication Data**
```tsx
// JWT token stored in localStorage
localStorage.setItem('jwt_token', data.token);

// User info stored in localStorage
localStorage.setItem('user_info', JSON.stringify(data.user));

// Farm info stored in localStorage (if available)
if (data.farm) {
  localStorage.setItem('farm_info', JSON.stringify(data.farm));
}
```

### **5. User Redirected Appropriately**
- **New user with farm**: Dashboard
- **New user without farm**: Setup profile
- **Existing user**: Dashboard

## 🛠️ **Utility Functions**

### **getAuthHeaders()**
Get authorization headers for API requests:

```tsx
const { getAuthHeaders } = useGoogleAuth();

const response = await fetch('/api/protected-endpoint', {
  headers: {
    'Content-Type': 'application/json',
    ...getAuthHeaders()
  }
});
```

### **Role Checking**
Check user permissions:

```tsx
const { hasRole, isOwner } = useGoogleAuth();

if (isOwner()) {
  // Show owner-only features
}

if (hasRole('manager')) {
  // Show manager features
}
```

### **New User Detection**
Handle first-time users:

```tsx
const { isNewUser } = useGoogleAuth();

if (isNewUser()) {
  // Show onboarding flow
  // Redirect to setup
  // Display welcome message
}
```

## 🚨 **Error Handling**

### **Common Error Scenarios**

1. **Google OAuth Client ID not configured**
   - Check your `.env.local` file
   - Verify `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` is set

2. **Backend connection failed**
   - Ensure backend is running on port 5001
   - Check network connectivity

3. **Invalid Google token**
   - Token may have expired
   - User needs to re-authenticate

4. **Database errors**
   - Backend logs will show specific errors
   - Check MongoDB connection

### **Error Handling in Components**

```tsx
<GoogleSignIn
  onError={(error) => {
    // Show user-friendly error message
    if (error.includes('Client ID not configured')) {
      setErrorMessage('Google authentication is not properly configured');
    } else if (error.includes('Invalid token')) {
      setErrorMessage('Authentication failed. Please try again.');
    } else {
      setErrorMessage('An unexpected error occurred');
    }
  }}
/>
```

## 🧪 **Testing**

### **Demo Page**
Visit `/google-auth-demo` to test all functionality:

- Basic Google Sign-In
- Google Sign-In with farm setup
- User info display
- Authentication status
- Configuration verification

### **Development Testing**
1. Set up your Google OAuth Client ID
2. Ensure backend is running
3. Test with real Google accounts
4. Check browser console for debug info
5. Verify localStorage storage
6. Test logout functionality

## 🔧 **Customization**

### **Styling the Google Button**
The Google Sign-In button is rendered by the SDK, but you can customize the container:

```tsx
<div 
  ref={buttonRef} 
  className="custom-button-container"
  style={{ 
    minHeight: '50px',
    border: '2px dashed #ccc',
    borderRadius: '8px'
  }}
/>
```

### **Custom Callbacks**
Add your own logic to success/error handlers:

```tsx
const handleSuccess = (user, farm) => {
  // Analytics tracking
  analytics.track('user_signed_in', { 
    method: 'google', 
    userId: user.id,
    isNewUser: user.isNewUser 
  });

  // Custom redirect logic
  if (user.isNewUser) {
    showWelcomeModal();
  }

  // Update app state
  dispatch({ type: 'SET_USER', payload: user });
};
```

## 📚 **API Reference**

### **useGoogleAuth Hook**

| Property | Type | Description |
|----------|------|-------------|
| `isAuthenticated` | `boolean` | Whether user is currently authenticated |
| `user` | `BackendUser \| null` | Current user object |
| `farm` | `BackendFarm \| null` | Current farm object |
| `token` | `string \| null` | JWT token |
| `isLoading` | `boolean` | Whether auth state is being checked |
| `login(user, token, farm?)` | `function` | Login function |
| `logout()` | `function` | Logout function |
| `getAuthHeaders()` | `function` | Get auth headers for API calls |
| `hasRole(role)` | `function` | Check if user has specific role |
| `isOwner()` | `function` | Check if user is farm owner |
| `isNewUser()` | `function` | Check if user is new |

### **BackendUser Interface**

```tsx
interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'worker';
  picture?: string;
  authMethod: 'local' | 'google';
  isNewUser: boolean;
}
```

### **BackendFarm Interface**

```tsx
interface BackendFarm {
  id: string;
  name: string;
  slug: string;
  plan: 'basic' | 'standard' | 'premium';
}
```

## 🎯 **Best Practices**

1. **Always handle errors gracefully** - Show user-friendly messages
2. **Use loading states** - Prevent multiple submissions
3. **Validate environment variables** - Check configuration on app start
4. **Implement proper logout** - Clear all stored data
5. **Handle token expiration** - Redirect to login when needed
6. **Use TypeScript** - Leverage type safety for better development
7. **Test thoroughly** - Verify all user flows work correctly

Your Google authentication system is now fully integrated and ready for production use! 🎉

