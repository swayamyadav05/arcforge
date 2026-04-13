import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const sessionToken = getSessionCookie(request);

  if (sessionToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  const callbackURL = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  loginUrl.searchParams.set("callbackURL", callbackURL);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/awakening/:path*"],
};
