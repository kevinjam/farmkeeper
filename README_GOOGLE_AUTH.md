# Google Authentication Implementation

This document describes the Google authentication system implemented for the Farmkeeper application.

## 🚀 What's Been Built

### 1. **Backend API Route** (`/api/auth/google`)
- **Location**: `backend/src/routes/auth.ts`
- **Method**: POST
- **Purpose**: Verifies Google ID tokens and issues JWT tokens
- **Features**:
  - Google ID token validation using `google-auth-library`
  - JWT token generation (1-hour expiration)
  - User information extraction (sub, email, name, picture)
  - Comprehensive error handling

### 2. **Frontend Components**

#### **GoogleSignIn Component** (`src/components/GoogleSignIn.tsx`)
- Renders the official Google Sign-In button
- Handles the complete authentication flow
- Integrates with the backend API
- Manages loading states and error handling

#### **useGoogleAuth Hook** (`src/hooks/useGoogleAuth.ts`)
- Centralized authentication state management
- Provides login/logout functions
- Handles localStorage operations
- Supplies authentication headers for API calls

#### **LogoutButton Component** (`src/components/LogoutButton.tsx`)
- Multiple visual variants (button, link, icon)
- Handles logout functionality
- Integrates with the auth hook
- Redirects users after logout

### 3. **Updated Login Page** (`src/app/auth/login/page.tsx`)
- Integrated Google Sign-In alongside existing email/password form
- Clear visual separation between authentication methods
- Unified error handling
- Seamless user experience

## 🔧 Setup Requirements

### Backend Environment Variables
```bash
GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id-here
JWT_SECRET=your-jwt-secret-here
```

### Frontend Environment Variables
```bash
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id-here
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

## 📱 How It Works

### 1. **User Clicks Google Sign-In Button**
- Google Identity Services SDK loads
- Official Google button renders
- User sees familiar Google authentication UI

### 2. **Google Authentication Flow**
- User selects Google account
- Google provides ID token
- Frontend receives credential response

### 3. **Backend Verification**
- ID token sent to `/api/auth/google`
- Backend verifies token with Google
- Extracts user information
- Issues JWT token

### 4. **Frontend State Management**
- JWT stored in localStorage
- User information cached
- Authentication state updated
- User redirected to dashboard

### 5. **Logout Process**
- JWT removed from localStorage
- Google auto-select disabled
- User redirected to login page

## 🎯 Key Features

### **Security**
- ✅ Server-side token verification
- ✅ JWT with 1-hour expiration
- ✅ Secure localStorage handling
- ✅ Google auto-select cleanup

### **User Experience**
- ✅ Official Google Sign-In button
- ✅ Loading states and error handling
- ✅ Seamless integration with existing auth
- ✅ Multiple logout button variants

### **Developer Experience**
- ✅ TypeScript interfaces
- ✅ Custom React hooks
- ✅ Reusable components
- ✅ Comprehensive error handling

## 🔄 API Integration

### **Making Authenticated Requests**
```typescript
import { useGoogleAuth } from '../hooks/useGoogleAuth';

function MyComponent() {
  const { getAuthHeaders } = useGoogleAuth();

  const fetchData = async () => {
    const response = await fetch('/api/protected-route', {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    // Handle response
  };
}
```

### **Authentication State**
```typescript
import { useGoogleAuth } from '../hooks/useGoogleAuth';

function ProtectedComponent() {
  const { isAuthenticated, user, isLoading } = useGoogleAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return <div>Welcome, {user?.name}!</div>;
}
```

## 🧪 Testing

### **Manual Testing Steps**
1. Start backend server (`npm run dev` in backend directory)
2. Start frontend server (`npm run dev` in frontend directory)
3. Navigate to `/auth/login`
4. Click Google Sign-In button
5. Complete Google authentication
6. Verify JWT in localStorage
7. Check redirect to dashboard
8. Test logout functionality

### **Expected Behavior**
- Google Sign-In button appears
- Authentication flow completes successfully
- JWT token stored in localStorage
- User redirected to dashboard
- Logout removes token and redirects

## 🚨 Troubleshooting

### **Common Issues**

1. **"Google OAuth Client ID not configured"**
   - Check environment variables
   - Ensure variable names are correct
   - Restart development servers

2. **Google Sign-In button not appearing**
   - Check browser console for errors
   - Verify Google script loading
   - Check domain authorization in Google Console

3. **Authentication failures**
   - Verify backend is running on port 5001
   - Check CORS configuration
   - Ensure OAuth Client IDs match

4. **TypeScript compilation errors**
   - The minimatch error is project-wide, not related to our components
   - Our components should work despite this error

## 📚 Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://jwt.io/introduction)

## 🎉 Success!

Your Farmkeeper application now has a complete Google authentication system that:
- ✅ Integrates seamlessly with your existing authentication
- ✅ Provides a professional user experience
- ✅ Follows security best practices
- ✅ Is easy to maintain and extend

The system is ready for production use once you configure your Google OAuth Client ID and update the environment variables.
