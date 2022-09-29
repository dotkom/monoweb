import { AppProps } from "next/app"
import { globalStyles } from "src/theme/global-style"

import { SessionProvider } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"

function CustomApp({ Component, pageProps }: AppProps): JSX.Element {
  globalStyles()
  return (
    <SessionProvider>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </SessionProvider>
  )
}

export default CustomApp
