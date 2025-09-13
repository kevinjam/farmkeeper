import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { apiClient } from "./api";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists in our backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5001'}/api/auth/google-signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: profile?.sub,
            }),
          });

          if (!response.ok) {
            console.error('Failed to authenticate with backend:', await response.text());
            return false;
          }

          const data = await response.json();
          
          // Store onboarding status in user object
          if (data.requiresOnboarding) {
            user.requiresOnboarding = true;
            user.tempGoogleId = profile?.sub;
          }

          return true;
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      
      // Pass through onboarding status
      if (user) {
        token.requiresOnboarding = user.requiresOnboarding;
        token.tempGoogleId = user.tempGoogleId;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.accessToken = token.accessToken as string;
        session.provider = token.provider as string;
        session.requiresOnboarding = token.requiresOnboarding as boolean;
        session.tempGoogleId = token.tempGoogleId as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Check if this is a Google sign-in and user needs onboarding
      if (url.includes('/dashboard') && url.includes('callbackUrl')) {
        // Extract the callback URL to check if it's dashboard
        const urlObj = new URL(url, baseUrl);
        const callbackUrl = urlObj.searchParams.get('callbackUrl');
        
        if (callbackUrl && callbackUrl.includes('/dashboard')) {
          // Redirect to onboarding instead of dashboard
          return `${baseUrl}/auth/onboarding`;
        }
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
