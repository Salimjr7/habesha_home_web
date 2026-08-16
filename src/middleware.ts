import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected route patterns
  const isOwnerRoute = pathname.startsWith("/owner");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");

  // Check for Better Auth session cookie
  const sessionCookie =
    req.cookies.get("better-auth.session_token") ||
    req.cookies.get("__Secure-better-auth.session_token");

  if ((isOwnerRoute || isAdminRoute || isAccountRoute) && !sessionCookie) {
    // In local dev/demo without cookies, we allow smooth SSR rendering with mock fallbacks,
    // but in production we redirect to login with redirect url.
    if (process.env.NODE_ENV === "production") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/admin/:path*", "/account/:path*"],
};
