import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth-token";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Sadece /admin yollarını denetle
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (sessionCookie) {
    const authResult = await verifySessionToken(sessionCookie);
    isAuthenticated = authResult.valid;
  }

  // Eğer giriş sayfasına gidiyorsa
  if (pathname === "/admin/giris") {
    // Zaten giriş yapmışsa direkt admin paneline yönlendir
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Diğer tüm /admin yolları için oturum kontrolü
  if (!isAuthenticated) {
    const loginUrl = new URL("/admin/giris", req.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
