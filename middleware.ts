import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const isAuthenticated = request.cookies.has("auth");

    const protectedPaths = ["/mypage", "/settings", "/dashboard"];
    const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

    if (isProtectedPath && !isAuthenticated) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/mypage/:path*", "/settings/:path*", "/dashboard/:path*"],
};
