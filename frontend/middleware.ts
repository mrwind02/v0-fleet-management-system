import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Only check cookies on client-side, skip middleware entirely during build
  if (process.env.NODE_ENV === "development") {
    const token = request.cookies.get("accessToken")?.value

    // Rotas protegidas (exceto login)
    const protectedRoutes = ["/dashboard", "/vehicles", "/drivers", "/maintenance", "/questionnaire", "/reports"]

    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

    if (isProtectedRoute && !token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Redirecionar login para dashboard se já autenticado
    if (request.nextUrl.pathname === "/login" && token) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/vehicles/:path*", "/drivers/:path*", "/login"],
}
