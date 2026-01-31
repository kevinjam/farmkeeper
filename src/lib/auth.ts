import { NextAuthOptions } from "next-auth";
import { apiClient } from "./api";

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth is now handled entirely by the backend
    // No Google provider needed in frontend
  ],
  callbacks: {
    // Google OAuth is now handled entirely by the backend
    // NextAuth is only used for session management, not authentication
    async redirect({ url, baseUrl }) {
      // For Google sign-in, always redirect to onboarding first
      // The onboarding page will check if user needs onboarding or redirect to dashboard
      if (url.includes('/auth/onboarding') || url.includes('callbackUrl=/auth/onboarding')) {
        return `${baseUrl}/auth/onboarding`;
      }
      
      // If trying to go to dashboard, redirect to onboarding first
      if (url.includes('/dashboard')) {
        return `${baseUrl}/auth/onboarding`;
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
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
