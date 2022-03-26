import { AppProps } from "next/app";
import { globalCss } from "@theme";
import Navbar from "@components/organisms/Navbar/Navbar";
import { Box } from "@components/primitives";

const globalStyles = globalCss({
  body: {
    textRendering: "optimizeLegibility",
    "-webkit-font-smoothing": "antialiased",
    "-moz-osx-font-smoothing": "grayscale",
    fontFamily: "$body",
  },
});

function CustomApp({ Component, pageProps }: AppProps): JSX.Element {
  globalStyles();
  return (
    <Box css={{ margin: 0, padding: 0 }}>
      <Navbar />
      <Component {...pageProps} />;
    </Box>
  );
}

export default CustomApp;
