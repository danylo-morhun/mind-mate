import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

// Validate required environment variables (skip during build)
if (process.env.NEXT_PHASE !== 'phase-production-build') {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error(
      "NEXTAUTH_SECRET is required. Please set it in your environment variables."
    );
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required. Please set them in your environment variables."
    );
  }
}

export const authOptions: NextAuthOptions = {
  // Required for production deployments - NextAuth uses this to encrypt JWT tokens
  secret: process.env.NEXTAUTH_SECRET,
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/gmail.labels",
            "https://www.googleapis.com/auth/drive",
            "https://www.googleapis.com/auth/documents",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/calendar",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt" as const,
  },
  // Debug mode in development
  debug: process.env.NODE_ENV === "development",
};
