import createMiddleware from 'next-intl/middleware';
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from '@/i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

// Roles that are required to enable 2FA before accessing /admin.
const TWOFA_REQUIRED_ROLES = ["SUPERADMIN", "ADMIN"];

const authMiddleware = withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Protect admin routes - only SUPERADMIN, ADMIN, EDITOR
    if (pathname.startsWith("/admin")) {
      const adminRoles = ["SUPERADMIN", "ADMIN", "EDITOR"];
      if (!token?.role || !adminRoles.includes(token.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Force 2FA setup for SUPERADMIN/ADMIN before any /admin access.
      if (
        TWOFA_REQUIRED_ROLES.includes(token.role as string) &&
        token.twoFactorEnabled === false &&
        pathname !== "/setup-2fa"
      ) {
        return NextResponse.redirect(new URL("/setup-2fa", req.url));
      }
    }

    // Same gate for the /setup-2fa page: if the user already has 2FA on, no
    // need to be there.
    if (
      pathname === "/setup-2fa" &&
      token?.twoFactorEnabled === true
    ) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth-protected routes — skip i18n
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname === "/setup-2fa"
  ) {
    return (authMiddleware as any)(req);
  }

  // Skip i18n for API, Next.js internals, and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Apply i18n middleware to all other routes
  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
