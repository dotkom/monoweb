import { NextPage } from "next"
import { SessionProvider } from "next-auth/react"
import { AppProps } from "next/app"
import { ReactElement, ReactNode } from "react"

import type { Session } from "next-auth"

import MainLayout from "../components/layout/MainLayout"
import { trpc } from "@/utils/trpc"
import "../styles/globals.css"
import { ThemeProvider } from "next-themes"
import { Poppins } from "@next/font/google"

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" })

// TODO: App directory?
export type NextPageWithLayout<P = Record<string, never>> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type CustomAppProps<P> = AppProps & {
  Component: NextPageWithLayout<P>
  pageProps: {
    session: Session | null
  }
}

function CustomApp<P>({ Component, pageProps }: CustomAppProps<P>): JSX.Element {
  const getLayout = Component.getLayout ?? ((page) => <MainLayout>{page}</MainLayout>)

  return (
    <ThemeProvider>
      <SessionProvider session={pageProps.session}>
        <div className={poppins.variable}>{getLayout(<Component {...pageProps} />)}</div>
      </SessionProvider>
    </ThemeProvider>
  )
}

export default trpc.withTRPC(CustomApp)
