import { QueryProvider } from "@/utils/trpc/QueryProvider"
import { PropsWithChildren } from "react"
import { Poppins } from "next/font/google"
import { cn } from "@dotkomonline/ui"
import MainLayout from "@/components/layout/MainLayout"
import "@dotkomonline/config/tailwind.css"
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
