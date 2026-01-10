import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

let nextAuthResult;

try {
  nextAuthResult = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
      Google({
        clientId: process.env.AUTH_GOOGLE_ID!,
        clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      }),
    ],
    callbacks: {
      session({ session, token }) {
        if (session.user && token.sub) {
          session.user.id = token.sub;
        }
        return session;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
    session: {
      strategy: "jwt",
    },
  });
} catch (error) {
  console.error("ERROR in NextAuth initialization:", error);
  throw error;
}

export const { handlers, auth, signIn, signOut } = nextAuthResult;
