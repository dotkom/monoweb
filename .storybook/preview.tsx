import { addDecorator, configure, StoryContext } from "@storybook/react";
import { theme } from "../src/styles/theme";
import { Container, ThemeProvider } from "theme-ui";
import * as NextImage from "next/image";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

const Image = NextImage.default;
Object.defineProperty(NextImage, "default", {
  configurable: true,
  value: (props) => <Image {...props} unoptimized />,
});

addDecorator((story) => (
  <ThemeProvider theme={theme}>
    <Container bg="white" p={2}>
      {story()}
    </Container>
  </ThemeProvider>
));

configure([require.context("../src/", true, /\.stories\.(tsx|mdx)$/)], module);
