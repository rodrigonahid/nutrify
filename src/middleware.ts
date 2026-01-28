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

// Auth routes that logged-in users shouldn't access
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all API routes to pass through
  // (they handle their own auth internally)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionToken = request.cookies.get("session")?.value;
  const isLoggedIn = !!sessionToken;

  // Check if this is a public page route
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // // Logged-in users trying to access auth routes (login/signup) - redirect to home
  // if (isLoggedIn && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  // Not logged in trying to access protected routes - redirect to login
  if (!isLoggedIn && !isPublicRoute) {
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
