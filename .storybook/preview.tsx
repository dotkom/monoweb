import { addDecorator, configure, StoryContext } from "@storybook/react";
import { theme } from "../src/styles/theme";
import { Container, ThemeProvider } from "theme-ui";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

addDecorator((story) => (
  <ThemeProvider theme={theme}>
    <Container p={4}>{story()}</Container>
  </ThemeProvider>
));

configure([require.context("../src/", true, /\.stories\.(tsx|mdx)$/)], module);
