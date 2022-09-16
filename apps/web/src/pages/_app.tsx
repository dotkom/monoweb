import { AppProps } from "next/app"
import { globalStyles } from "src/theme/global-style"
import { Box } from "@components/primitives"
import Navbar from "@components/organisms/Navbar"
import { SessionProvider } from "next-auth/react"

function CustomApp({ Component, pageProps }: AppProps): JSX.Element {
  globalStyles()
  return (
    <SessionProvider>
      <Box css={{ margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
        <Navbar />
        <Component {...pageProps} />
      </Box>
    </SessionProvider>
  )
}

export default CustomApp
