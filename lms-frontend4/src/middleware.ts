// middleware.ts

import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, URLS } from "./config/constants";

const protectedRoutes = [URLS.HOME, URLS.ROOT];

export default function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value || "";

  if (!session && request.nextUrl.pathname.startsWith(URLS.HOME)) {
    const absoluteURL = new URL(URLS.LOGIN, request.nextUrl.origin);
    absoluteURL.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(absoluteURL.toString());
  }

  // Redirect to log in if session is not set
  if (!session && protectedRoutes.includes(request.nextUrl.pathname)) {
    const absoluteURL = new URL(URLS.LOGIN, request.nextUrl.origin);
    absoluteURL.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(absoluteURL.toString());
  }

  // Redirect to home if session is set and user tries to access root
  if (session && request.nextUrl.pathname === URLS.ROOT) {
    const absoluteURL = new URL(URLS.HOME, request.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }
}
