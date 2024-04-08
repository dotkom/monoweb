import MainLayout from "@/components/layout/MainLayout"
import { QueryProvider } from "@/utils/trpc/QueryProvider"
import "@dotkomonline/config/tailwind.css"
import { cn } from "@dotkomonline/ui"
import { Poppins } from "next/font/google"
import type { PropsWithChildren } from "react"
import "../styles/globals.css"

export const metadata = {
  title: "Onlineweb 5",
  description: "Linjeforeningen Onlines nettsider",
}

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" })

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={cn(poppins.variable, "h-full w-full")}>
        <QueryProvider>
          <MainLayout>{children}</MainLayout>
        </QueryProvider>
      </body>
    </html>
  )
}
