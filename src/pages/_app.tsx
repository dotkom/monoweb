import { AppProps } from "next/app";
import { globalCss } from "@theme";

const globalStyles = globalCss({
  body: {
    textRendering: "optimizeLegibility",
    "-webkit-font-smoothing": "antialiased",
    "-moz-osx-font-smoothing": "grayscale",
  },
});

function CustomApp({ Component, pageProps }: AppProps): JSX.Element {
  globalStyles();
  return <Component {...pageProps} />;
}

export default CustomApp;
