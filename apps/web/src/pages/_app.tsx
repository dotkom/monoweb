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
export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type CustomAppProps = AppProps & {
  Component: NextPageWithLayout
  pageProps: {
    session: Session | null
  }
}

function CustomApp({ Component, pageProps }: CustomAppProps): JSX.Element {
  globalStyles()

  const getLayout = Component.getLayout ?? ((page) => <MainLayout>{page}</MainLayout>)

  return <SessionProvider session={pageProps.session}>{getLayout(<Component {...pageProps} />)}</SessionProvider>
}

export default trpc.withTRPC(CustomApp)
