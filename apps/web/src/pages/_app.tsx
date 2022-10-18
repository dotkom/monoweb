import { AppProps } from "next/app"
import { globalStyles } from "src/theme/global-style"

import { SessionProvider } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { NextPage } from "next"
import { ReactElement, ReactNode } from "react"

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
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
