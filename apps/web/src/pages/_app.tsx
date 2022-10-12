import { AppProps } from "next/app"
import { globalStyles } from "src/theme/global-style"
import { Box } from "@components/primitives"
import Navbar from "@components/organisms/Navbar"
import { createStyles, styled } from "@theme"

function CustomApp({ Component, pageProps }: AppProps): JSX.Element {
  globalStyles()
  return (
    <Box css={{ margin: 0, padding: 0 }}>
      <Navbar />
      <Container>
        <Component {...pageProps} />
      </Container>
    </Box>
  )
}

const styles = createStyles({
  container: {
    marginTop: "80px",
  },
})

const Container = styled("div", styles.container)

export default CustomApp
