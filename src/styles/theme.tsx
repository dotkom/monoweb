import type { Theme } from "theme-ui";

export const theme: Theme = {
  fonts: {
    body: "system-ui, sans-serif",
    heading: '"Avenir Next", sans-serif',
    monospace: "Menlo, monospace",
  },
  colors: {
    text: "#000",
    white: "#fff",
    primary: "#33e",
  },
  buttons: {
    primary: {
      bg: "primary",
      text: "white",
      borderRadius: "4px",
      "&:hover": {
        transform: "translateY(-1px)",
      },
      "&:active": {
        transform: "translateY(2px)",
      },
    },
  },
};
