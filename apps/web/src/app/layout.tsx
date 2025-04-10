import { QueryProvider } from "@/utils/trpc/QueryProvider"
import "@dotkomonline/config/tailwind.css"
import { cn } from "@dotkomonline/ui"
import { Fraunces, Poppins } from "next/font/google"
import type { PropsWithChildren } from "react"
import "../styles/globals.css"
import "@mdxeditor/editor/style.css"
import { auth } from "@/auth"
import { Footer } from "@/components/organisms/Footer/Footer"
import { Navbar } from "@/components/organisms/Navbar/Navbar"
import { SessionProvider } from "@dotkomonline/oauth2/react"
import { ThemeProvider } from "next-themes"

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
      <body className={cn(fraunces.variable, poppins.variable, "w-full h-screen")}>
        <SessionProvider session={session}>
          <QueryProvider>
            <ThemeProvider>
              <div className="m-0 flex h-screen flex-col items-center justify-between p-0 font-poppins">
                <Navbar />
                <main className="mb-auto w-full max-w-screen-xl px-2 sm:px-10">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
