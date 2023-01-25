import { NextPage } from "next"
import { SessionProvider } from "next-auth/react"
import { AppProps } from "next/app"
import { ReactElement, ReactNode } from "react"

import type { Session } from "next-auth"

import MainLayout from "../components/layout/MainLayout"
import "../styles/globals.css"
import { globalStyles } from "../theme/global-style"
import { trpc } from "@/utils/trpc"

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
  globalStyles()

  const getLayout = Component.getLayout ?? ((page) => <MainLayout>{page}</MainLayout>)

  return <SessionProvider session={pageProps.session}>{getLayout(<Component {...pageProps} />)}</SessionProvider>
}

export default trpc.withTRPC(CustomApp)
