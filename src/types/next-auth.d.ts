import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  }

  interface JWT {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }
}

declare module "next-auth/providers/google" {
  interface GoogleProfile {
    sub: string;
    name: string;
    email: string;
    picture: string;
  }
}
