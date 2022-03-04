import { AppProps } from "next/app";
import { ThemeProvider } from "theme-ui";
import { theme } from "@styles/theme";
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
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default CustomApp;
