import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import { checkRateLimit, resetRateLimit } from "./rate-limit";
import { logAuditEvent } from "./audit";
import { verifyTotp } from "./totp";

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
        // Optional: TOTP code (or recovery code XXXX-XXXX) when the account has
        // 2FA enabled. The login UI submits the credentials twice — first
        // without `code` to learn whether 2FA is required, then with the code.
        code: { label: "Codi", type: "text" },
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
          console.warn(`[auth] login_failed reason=user_not_found email=${credentials.email} ip=${ip}`);
          await logAuditEvent({
            action: "login_failed",
            actorEmail: credentials.email,
            ipAddress: ip,
            metadata: { reason: "user_not_found" },
          });
          throw new Error(GENERIC_CREDENTIAL_ERROR);
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          console.warn(`[auth] login_failed reason=password_mismatch email=${credentials.email} ip=${ip}`);
          await logAuditEvent({
            action: "login_failed",
            actorId: user.id,
            actorEmail: user.email,
            ipAddress: ip,
            metadata: { reason: "password_mismatch" },
          });
          throw new Error(GENERIC_CREDENTIAL_ERROR);
        }

        // 2FA gating. If the user has it enabled, we need a valid TOTP or
        // recovery code; otherwise we tell the client to ask the user for
        // one and re-submit.
        if (user.twoFactorEnabled && user.twoFactorSecret) {
          const code = (credentials.code || "").trim();
          if (!code) {
            // Sentinel error string; the login page detects this and shows the
            // 2FA input.
            throw new Error("TOTP_REQUIRED");
          }

          // Recovery codes look like XXXX-XXXX (uppercase hex with dash).
          // Numeric 6-digit codes are TOTP. Try TOTP first.
          let valid = false;
          let usedRecovery = false;
          if (/^\d{6}$/.test(code.replace(/\s+/g, ""))) {
            valid = verifyTotp(user.twoFactorSecret, code);
          } else {
            // Recovery code path — compare against the stored bcrypt hashes.
            const normalised = code.toUpperCase();
            for (const hashed of user.twoFactorRecoveryCodes) {
              // eslint-disable-next-line no-await-in-loop
              if (await compare(normalised, hashed)) {
                valid = true;
                usedRecovery = true;
                // Consume this code.
                await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    twoFactorRecoveryCodes: user.twoFactorRecoveryCodes.filter(
                      (h) => h !== hashed,
                    ),
                  },
                });
                break;
              }
            }
          }

          if (!valid) {
            await logAuditEvent({
              action: "2fa_failed",
              actorId: user.id,
              actorEmail: user.email,
              ipAddress: ip,
            });
            throw new Error("TOTP_INVALID");
          }

          if (usedRecovery) {
            await logAuditEvent({
              action: "2fa_recovery_used",
              actorId: user.id,
              actorEmail: user.email,
              ipAddress: ip,
              metadata: {
                remaining: user.twoFactorRecoveryCodes.length - 1,
              },
            });
          }
        }

        // Hash login is fully validated — clear the rate budget and emit a
        // success event.
        await resetRateLimit(rateKey);
        await logAuditEvent({
          action: "login_success",
          actorId: user.id,
          actorEmail: user.email,
          ipAddress: ip,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // The shape returned by `authorize()` is wider than NextAuth's
        // built-in User type. Use a narrow inline type rather than `as unknown`.
        const u = user as { id: string; role: typeof token.role; twoFactorEnabled?: boolean };
        token.id = u.id;
        token.role = u.role;
        token.twoFactorEnabled = u.twoFactorEnabled ?? false;
        return token;
      }
      // Subsequent calls (no `user`): refresh role and twoFactorEnabled from
      // the DB so changes (admin enabling 2FA, role promotion) take effect
      // without a forced logout.
      if (token.id) {
        try {
          const fresh = await prisma.user.findUnique({
            where: { id: token.id },
            select: { role: true, twoFactorEnabled: true },
          });
          if (fresh) {
            token.role = fresh.role;
            token.twoFactorEnabled = fresh.twoFactorEnabled;
          }
        } catch {
          // DB hiccup — keep the existing token values.
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.twoFactorEnabled = token.twoFactorEnabled;
      }
      return session;
    },
  },
};
