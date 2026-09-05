import { getPathname } from "@/i18n/navigation"
import createMiddleware from "next-intl/middleware"
import { type NextRequest, NextResponse } from "next/server"
import { readLocalePreference } from "./i18n/locale-preference"
import { locales, routing } from "./i18n/routing"

const handleI18nRouting = createMiddleware(routing)

function hasLocalePrefix(pathname: string) {
  return locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))
}

// biome-ignore lint/style/noDefaultExport: required by next-intl
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (!hasLocalePrefix(pathname)) {
    const preference = readLocalePreference(request.cookies)

    if (preference === "en") {
      const path = getPathname({ href: pathname, locale: preference })
      return NextResponse.redirect(new URL(`${path}${search}`, request.url))
    }
  }

  return handleI18nRouting(request)
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|health|pulse|.*\\..*).*)",
}
