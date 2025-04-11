import { auth } from "@/auth"
import { Footer } from "@/components/Footer/Footer"
import { Navbar } from "@/components/Navbar/Navbar"
import { QueryProvider } from "@/utils/trpc/QueryProvider"
import { SessionProvider } from "@dotkomonline/oauth2/react"
import { cn } from "@dotkomonline/ui"
import { ThemeProvider } from "next-themes"
import { Fraunces, Poppins } from "next/font/google"
import type { PropsWithChildren } from "react"
import "../globals.css"
import "@mdxeditor/editor/style.css"

export const metadata = {
  title: "Onlineweb 5",
  description: "Linjeforeningen Onlines nettsider",
}

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" })
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-fraunces" })

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await auth.getServerSession()
  return (
    // suppressHydrationWarning is needed for next-themes, see https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fraunces.variable, poppins.variable)}>
        <SessionProvider session={session}>
          <QueryProvider>
            <ThemeProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow px-4 lg:px-10 lg:py-6">
                  <div className="mx-auto w-full max-w-screen-xl">{children}</div>
                </main>
                <Footer />
              </div>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
