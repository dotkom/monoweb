import { AppProps } from "next/app"
import { globalStyles } from "src/theme/global-style"

import { SessionProvider } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { NextPage } from "next"
import { ReactElement, ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { trpc } from "@/utils/trpc"
import { httpBatchLink } from "@trpc/client"

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
