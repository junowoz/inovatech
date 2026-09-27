import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/constants";

// Named proxy.ts (Next 16 middleware convention, export `proxy`). Only checks
// that the session cookie is present — cheap and edge-safe. The real check
// (session exists in D1, not expired) happens in requireUser()/requireAdmin()
// on every protected page and Server Action.
const PROTECTED_PREFIXES = ["/dashboard"];

export async function proxy(request: NextRequest) {
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (isProtected && !request.cookies.get(SESSION_COOKIE)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image files so
     * `/dashboard/*` stays guarded on every navigable request.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
