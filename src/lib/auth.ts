import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      // Зберігаємо access_token та refresh_token
      if (account) {
        console.log('JWT callback - account:', {
          access_token: account.access_token ? 'present' : 'missing',
          refresh_token: account.refresh_token ? 'present' : 'missing',
          expires_at: account.expires_at
        });
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      console.log('JWT callback - token:', {
        accessToken: token.accessToken ? 'present' : 'missing',
        refreshToken: token.refreshToken ? 'present' : 'missing'
      });
      return token;
    },
    async session({ session, token }) {
      // Передаємо токени в сесію
      console.log('Session callback - token:', {
        accessToken: token.accessToken ? 'present' : 'missing',
        refreshToken: token.refreshToken ? 'present' : 'missing',
        accessTokenValue: token.accessToken ? token.accessToken.substring(0, 20) + '...' : 'none'
      });
      
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      
      console.log('Session callback - session:', {
        accessToken: session.accessToken ? 'present' : 'missing',
        accessTokenValue: session.accessToken ? session.accessToken.substring(0, 20) + '...' : 'none'
      });
      
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
};
