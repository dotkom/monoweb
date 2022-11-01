import MainLayout from "@/components/layout/MainLayout"
import { NextPage } from "next"
import { SessionProvider } from "next-auth/react"
import { AppProps } from "next/app"
import { ReactElement, ReactNode } from "react"
import { globalStyles } from "src/theme/global-style"

import "./globals.css"

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function CustomApp({ Component, pageProps }: AppPropsWithLayout): JSX.Element {
  const getLayout = Component.getLayout ?? ((page) => <MainLayout>{page}</MainLayout>)
  globalStyles()

  return <SessionProvider>{getLayout(<Component {...pageProps} />)}</SessionProvider>
}

export default CustomApp
