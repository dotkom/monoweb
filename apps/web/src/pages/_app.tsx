import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { NextPage } from "next"
import { SessionProvider } from "next-auth/react"
import { AppProps } from "next/app"
import { ReactElement, ReactNode, useState } from "react"

<<<<<<< HEAD
import { httpBatchLink } from "@trpc/client"

import MainLayout from "../components/layout/MainLayout"
import "../styles/globals.css"
import { globalStyles } from "../theme/global-style"
import { trpc } from "../utils/trpc"
=======
import { SessionProvider } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { NextPage } from "next"
import { ReactElement, ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { trpc } from "@/utils/trpc"
import { httpBatchLink } from "@trpc/client"
>>>>>>> 8489c56 (test out oidc login)

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function CustomApp({ Component, pageProps }: AppPropsWithLayout): JSX.Element {
  globalStyles()
  const getLayout = Component.getLayout ?? ((page) => <MainLayout>{page}</MainLayout>)

  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:4000/trpc",
        }),
      ],
    })
  )

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>{getLayout(<Component {...pageProps} />)}</QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  )
}

export default CustomApp
