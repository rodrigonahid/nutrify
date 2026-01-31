import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/api/auth/login",
  "/api/auth/signup",
  "/api/invite-codes/validate",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all API routes to pass through
  // (they handle their own auth internally)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionToken = request.cookies.get("session")?.value;
  const hasSessionCookie = !!sessionToken;

  // Check if this is a public page route
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Not logged in trying to access protected routes - redirect to login
  // Note: We only check cookie presence here. The actual session validity
  // is verified server-side by getSession(). If the cookie exists but the
  // session is invalid, the page will clear it and redirect to login.
  if (!hasSessionCookie && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
