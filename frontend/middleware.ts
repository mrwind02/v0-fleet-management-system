import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Only check cookies on client-side, skip middleware entirely during build
  // const token = request.cookies.get("accessToken")?.value
  // const protectedRoutes = ["/dashboard", "/vehicles", "/drivers", "/maintenance", "/questionnaire", "/reports"]
  // const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // if (isProtectedRoute && !token) {
  //   return NextResponse.redirect(new URL("/login", request.url))
  // }

  // if (request.nextUrl.pathname === "/login" && token) {
  //   return NextResponse.redirect(new URL("/dashboard", request.url))
  // }
  return NextResponse.next()

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/vehicles/:path*", "/drivers/:path*", "/login"],
}
