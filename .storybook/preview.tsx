import { ThemeProvider } from "@theme-ui/core";
import { StoryContext } from "@storybook/react";
import { theme } from "../src/styles/theme";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

const withTheme = (StoryFn: Function, context: StoryContext) => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <StoryFn />
      </ThemeProvider>
    </>
  );
};
export const decorators = [withTheme];
