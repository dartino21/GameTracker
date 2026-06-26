import { getToken } from "next-auth/jwt"
import { type NextRequest, NextResponse } from "next/server"

const authRoutes = new Set(["/login", "/register"])
const publicRoutes = new Set(["/welcome"])

function isPublicPath(pathname: string) {
  return (
    authRoutes.has(pathname) ||
    publicRoutes.has(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/search") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  )
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (token && authRoutes.has(pathname)) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!token && !isPublicPath(pathname)) {
    const welcomeUrl = new URL("/welcome", request.url)
    welcomeUrl.searchParams.set("callbackUrl", `${pathname}${search}`)

    return NextResponse.redirect(welcomeUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
}
