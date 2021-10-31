import { AppProps } from "next/app";
import { ThemeProvider } from "theme-ui";
import { theme } from "@styles/theme";

function CustomApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default CustomApp;
