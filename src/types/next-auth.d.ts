import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    provider?: string
    requiresOnboarding?: boolean
    tempGoogleId?: string
    backendToken?: string
    farmData?: {
      id: string
      name: string
      slug: string
    }
    isNewUser?: boolean
  }
  
  interface User {
    requiresOnboarding?: boolean
    tempGoogleId?: string
    backendToken?: string
    farmData?: {
      id: string
      name: string
      slug: string
    }
    isNewUser?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    provider?: string
    requiresOnboarding?: boolean
    tempGoogleId?: string
    backendToken?: string
    farmData?: {
      id: string
      name: string
      slug: string
    }
    isNewUser?: boolean
  }
}
