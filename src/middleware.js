import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Retrieve token (JWT session)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 1. Protect mutating API routes: POST, PUT, DELETE
  // Check if API paths match mutating operations
  if (pathname.startsWith("/api/")) {
    const isAuthRoute = pathname.startsWith("/api/auth");
    const isMutatingMethod = ["POST", "PUT", "DELETE"].includes(request.method);

    if (isMutatingMethod && !isAuthRoute) {
      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized access: admin session required." }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    }
  }

  // 2. Protect Admin pages /admin/*
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Define which paths this middleware runs on
  matcher: ["/admin/:path*", "/api/:path*"],
};
