import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });
        
        if (!user || !user.senha) return null;
        
        if (!user.emailVerified) {
          throw new Error("Sua conta não está ativada. Verifique seu e-mail.");
        }
        
        const passwordsMatch = await bcrypt.compare(
          credentials.senha as string,
          user.senha
        );
        
        if (passwordsMatch) {
          if (user.senhaTemporaria && user.senhaTemporariaExpira && user.senhaTemporariaExpira < new Date()) {
            throw new Error("Senha temporária expirada. Peça ao administrador para reenviar.");
          }
          return user;
        }
        return null;
      }
    })
  ]
});
