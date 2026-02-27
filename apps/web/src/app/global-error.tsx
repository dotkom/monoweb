"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"
import { cn, Title, Text } from "@dotkomonline/ui"
import PlausibleProvider from "next-plausible"
import { QueryProvider } from "@/utils/trpc/QueryProvider"
import { Footer } from "@/components/Footer/Footer"
import { Navbar } from "@/components/Navbar/Navbar"
import { ThemeProvider } from "next-themes"

export type GlobalErrorProps = {
  error: Error & { digest?: string }
}

export default function GlobalError({ error }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="no">
      <body className={cn("bg-white dark:bg-stone-900")}>
        <PlausibleProvider domain="online.ntnu.no">
          <QueryProvider>
            <ThemeProvider defaultTheme="system" enableSystem attribute="data-theme">
              <div className="min-h-screen flex flex-col gap-8 w-full max-w-screen-xl mx-auto px-4 lg:px-12">
                <Navbar />
                <main className="grow flex flex-col gap-8">
                  <Title>En feil oppsto under innlasting av innhold.</Title>

                  <div className="rounded-lg p-4 bg-red-300 dark:bg-red-800">
                    <Text>
                      <strong>Detaljer:</strong> {error.message} {error.digest && `(digest=${error.digest})`}
                    </Text>
                  </div>

                  <Text className="text-gray-800 dark:text-stone-400" size="lg">
                    Om feilen vedvarer, vennligst prøv å slette cookies eller refreshe siden.
                  </Text>
                </main>
                <Footer />
              </div>
            </ThemeProvider>
          </QueryProvider>
        </PlausibleProvider>
      </body>
    </html>
  )
}
