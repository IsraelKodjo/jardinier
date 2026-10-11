import { NextAuthOptions } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "jardinier-secret-fallback-token-key-32chars",
  adapter: DrizzleAdapter(db) as any,
  session: {
    strategy: "jwt", // Obligatoire pour CredentialsProvider
  },
  pages: {
    signIn: '/connexion', 
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 1. Chercher l'utilisateur dans la base de données
        const userResults = await db.select().from(users).where(eq(users.email, credentials.email));
        const user = userResults[0];

        if (!user || !user.password) {
          return null; // Utilisateur non trouvé ou pas de mot de passe (inscrit via OAuth)
        }

        // 2. Vérifier le mot de passe hashé avec bcrypt
        const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

        if (!passwordsMatch) {
          return null; // Mauvais mot de passe
        }

        // 3. Retourner l'utilisateur (seuls les champs renvoyés seront stockés dans le JWT)
        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  }
};
