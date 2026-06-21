import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Eenvoudige brute-force-rem: max mislukte pogingen per e-mail binnen een venster.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED = 5;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function isLocked(email: string): boolean {
  const a = loginAttempts.get(email);
  return !!a && Date.now() < a.resetAt && a.count >= MAX_FAILED;
}

function recordFailure(email: string): void {
  const now = Date.now();
  const a = loginAttempts.get(email);
  if (!a || now > a.resetAt) {
    loginAttempts.set(email, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    a.count += 1;
  }
}

function clearFailures(email: string): void {
  loginAttempts.delete(email);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();
        if (isLocked(email)) {
          throw new Error("Te veel mislukte pogingen. Probeer over 15 minuten opnieuw.");
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          recordFailure(email);
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          recordFailure(email);
          return null;
        }

        clearFailures(email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
