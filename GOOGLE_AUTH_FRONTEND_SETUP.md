# Frontend Google Authentication Setup

This guide explains how to set up Google authentication for your Farmkeeper React frontend.

## Environment Variables

Create a `.env.local` file in your frontend directory with the following variables:

```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your-google-oauth-client-id-here

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

## Getting Google OAuth Client ID

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application" as the application type
6. Add your authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
7. Add your authorized redirect URIs:
   - `http://localhost:3000/auth/login` (for development)
   - `https://yourdomain.com/auth/login` (for production)
8. Copy the Client ID and add it to your `.env.local` file

## Components Created

### 1. GoogleSignIn Component (`src/components/GoogleSignIn.tsx`)
- Renders the Google Sign-In button
- Handles authentication flow
- Sends ID token to backend
- Manages loading and error states

### 2. useGoogleAuth Hook (`src/hooks/useGoogleAuth.ts`)
- Manages authentication state
- Provides login/logout functions
- Handles localStorage operations
- Provides authentication headers for API calls

### 3. LogoutButton Component (`src/components/LogoutButton.tsx`)
- Multiple variants (button, link, icon)
- Handles logout functionality
- Redirects to login page

## Usage Examples

### Basic Google Sign-In
```tsx
import GoogleSignIn from '../components/GoogleSignIn';

function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      <GoogleSignIn 
        onSuccess={(user) => console.log('User signed in:', user)}
        onError={(error) => console.error('Sign-in error:', error)}
      />
    </div>
  );
}
```

### Using the Auth Hook
```tsx
import { useGoogleAuth } from '../hooks/useGoogleAuth';

function Dashboard() {
  const { isAuthenticated, user, logout, getAuthHeaders } = useGoogleAuth();

  const fetchData = async () => {
    const response = await fetch('/api/data', {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      }
    });
    // ... handle response
  };

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Logout Button Variants
```tsx
import LogoutButton from '../components/LogoutButton';

function Header() {
  return (
    <header>
      <h1>FarmKeeper</h1>
      <LogoutButton variant="icon" />
    </header>
  );
}
```

## Integration Points

The Google authentication is now integrated into your existing login page at `/auth/login`. Users can:

1. **Sign in with Google** - Uses the new Google Identity Services SDK
2. **Sign in with email/password** - Your existing authentication system
3. **Switch between methods** - Clear visual separation between options

## Security Features

- **Token Storage**: JWT tokens stored securely in localStorage
- **Auto-cleanup**: Google auto-select disabled on logout
- **Error Handling**: Comprehensive error handling and user feedback
- **State Management**: Centralized authentication state management

## Testing

1. Start your backend server (should be running on port 5001)
2. Start your frontend development server (`npm run dev`)
3. Navigate to `/auth/login`
4. Click the Google Sign-In button
5. Complete the Google authentication flow
6. Verify the JWT is stored in localStorage
7. Check that you're redirected to the dashboard

## Troubleshooting

### Common Issues:

1. **"Google OAuth Client ID not configured"**
   - Check your `.env.local` file
   - Ensure the variable name is exactly `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID`

2. **"Authentication failed"**
   - Verify your backend is running on port 5001
   - Check that your Google OAuth Client ID matches between frontend and backend
   - Ensure your backend has the correct environment variables

3. **Google Sign-In button not appearing**
   - Check browser console for JavaScript errors
   - Verify the Google Identity Services script is loading
   - Check that your domain is authorized in Google Cloud Console

4. **CORS errors**
   - Ensure your backend CORS settings include `http://localhost:3000`
   - Check that your backend is properly configured for cross-origin requests
