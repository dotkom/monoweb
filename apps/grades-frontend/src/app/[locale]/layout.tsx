import { env } from "@/env"
import { getPathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { QueryProvider } from "@/utils/trpc/QueryProvider"
import { cn } from "@dotkomonline/ui"
import { toAbsoluteUrl } from "@dotkomonline/utils"
import type { Metadata } from "next"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"
import PlausibleProvider from "next-plausible"
import { ThemeProvider } from "next-themes"
import { Figtree, Inter } from "next/font/google"
import { notFound } from "next/navigation"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import type { PropsWithChildren } from "react"
import "../../globals.css"
import { Footer } from "./components/Footer"
import { Navbar } from "./components/navbar/Navbar"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = await getTranslations("Metadata.layout")
  const { locale: rawLocale } = await params
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale

  const title = t("title")
  const description = t("description")

  const noPath = getPathname({ href: `/`, locale: "no" })
  const enPath = getPathname({ href: `/`, locale: "en" })
  const canonicalPath = getPathname({ href: `/`, locale })
  const canonical = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, canonicalPath)
  const noUrl = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, noPath)
  const enUrl = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, enPath)

  return {
    title,
    description,
    alternates: {
      canonical: canonical,
      languages: { no: noUrl, en: enUrl, "x-default": noUrl },
    },
    metadataBase: new URL(env.NEXT_PUBLIC_ORIGIN),
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    openGraph: {
      locale: locale === "no" ? "nb_NO" : "en_US",
      title,
      description,
      url: canonical,
      siteName: "Grades.no",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

const fontBody = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" })
const fontTitle = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-title" })

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
    // suppressHydrationWarning is needed for next-themes, see https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(fontTitle.variable, fontBody.variable, "bg-white dark:bg-stone-900")}>
        <PlausibleProvider domain="grades.no" pageviewProps={{ locale }}>
          <QueryProvider>
            <ThemeProvider defaultTheme="system" enableSystem attribute="data-theme" disableTransitionOnChange>
              <NextIntlClientProvider>
                <NuqsAdapter>
                  <div className="flex min-h-screen flex-col gap-8">
                    <Navbar />
                    <div className="mx-auto flex w-full max-w-7xl grow flex-col gap-8 px-4 lg:px-12">
                      <main className="grow">{children}</main>
                    </div>
                    <Footer />
                  </div>
                </NuqsAdapter>
              </NextIntlClientProvider>
            </ThemeProvider>
          </QueryProvider>
        </PlausibleProvider>
      </body>
    </html>
  )
}
