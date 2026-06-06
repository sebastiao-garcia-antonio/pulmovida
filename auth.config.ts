import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tipo = user.tipo;
        token.id = user.id;
        token.senhaTemporaria = (user as any).senhaTemporaria;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.tipo = token.tipo as string;
        session.user.id = token.id as string;
        (session.user as any).senhaTemporaria = token.senhaTemporaria;
      }
      return session;
    }
  },
  providers: [], // Configure in auth.ts
} satisfies NextAuthConfig;
