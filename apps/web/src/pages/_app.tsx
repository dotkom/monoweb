import { AppProps } from "next/app";
import { globalStyles } from "src/theme/global-style";
import { Box } from "@components/primitives";
import Navbar from "@components/organisms/Navbar";

function CustomApp({ Component, pageProps }: AppProps): JSX.Element {
  globalStyles();
  return (
    <Box css={{ margin: 0, padding: 0 }}>
      <Navbar />
      <Component {...pageProps} />
    </Box>
  );
}

export default CustomApp;
