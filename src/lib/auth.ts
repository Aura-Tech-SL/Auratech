import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import { checkRateLimit, resetRateLimit } from "./rate-limit";

const LOGIN_RATE_MAX = 5;
const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;

// Uniform message returned for every credential failure (wrong email, wrong
// password, malformed input). Internal logs MAY distinguish the cases; the
// client never sees the difference.
const GENERIC_CREDENTIAL_ERROR = "Email o contrasenya incorrectes";

function extractClientIp(req: { headers?: Record<string, string | string[] | undefined> } | undefined): string {
  const headers = req?.headers ?? {};
  const xff = headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) {
    return xff.split(",")[0].trim();
  }
  if (Array.isArray(xff) && xff[0]) return xff[0];
  const xri = headers["x-real-ip"];
  if (typeof xri === "string" && xri.length > 0) return xri;
  return "unknown";
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contrasenya", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(GENERIC_CREDENTIAL_ERROR);
        }

        // Rate-limit by IP first — applied before any DB lookup so brute force
        // attempts can't even check whether an email exists.
        const ip = extractClientIp(req as { headers?: Record<string, string | string[] | undefined> });
        const rateKey = `login:${ip}`;
        const rate = await checkRateLimit(rateKey, LOGIN_RATE_MAX, LOGIN_RATE_WINDOW_MS);
        if (!rate.allowed) {
          // Surface a distinct message so the user understands what's happening
          // and waits, rather than thinking they keep typing wrong.
          throw new Error("Massa intents. Torna a provar en uns minuts.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          // Distinguish in server logs but not in the response — prevents
          // attackers from enumerating valid emails.
          console.warn(`[auth] login_failed reason=user_not_found email=${credentials.email} ip=${ip}`);
          throw new Error(GENERIC_CREDENTIAL_ERROR);
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          console.warn(`[auth] login_failed reason=password_mismatch email=${credentials.email} ip=${ip}`);
          throw new Error(GENERIC_CREDENTIAL_ERROR);
        }

        // Successful login — reset the failed-attempts budget so a user who
        // typed wrong four times doesn't carry that history forward.
        await resetRateLimit(rateKey);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: typeof token.role }).role;
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
