import { NextPage } from "next"
import { AppProps } from "next/app"
import { ReactElement, ReactNode } from "react"
import { ClerkProvider } from "@clerk/nextjs"
import MainLayout from "../components/layout/MainLayout"
import { trpc } from "@/utils/trpc"
import "@dotkomonline/config/tailwind.css"
import "../styles/globals.css"
import { ThemeProvider } from "next-themes"
import { Poppins } from "@next/font/google"
import { cn } from "@dotkomonline/ui"

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" })

// TODO: App directory?
export type NextPageWithLayout<P = Record<string, never>> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type CustomAppProps<P> = AppProps & {
  Component: NextPageWithLayout<P>
}

function CustomApp<P>({ Component, pageProps }: CustomAppProps<P>): JSX.Element {
  const getLayout = Component.getLayout ?? ((page) => <MainLayout>{page}</MainLayout>)

  return (
    <ThemeProvider>
      <ClerkProvider {...pageProps}>
        <div className={cn(poppins.variable, "h-full w-full")}>{getLayout(<Component {...pageProps} />)}</div>
      </ClerkProvider>
    </ThemeProvider>
  )
}

export default trpc.withTRPC(CustomApp)
