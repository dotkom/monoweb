import type { Theme } from "theme-ui";
import componentThemes from "./components";
import { typography } from "./typography";

export const theme: Theme = {
  colors: {
    text: "#000",
    background: "#fff",
    primary: "#11e",
    secondary: "#c0c",
    highlight: "#e0e",
    muted: "#f6f6ff",
    modes: {
      dark: {
        text: "#fff",
        background: "#000",
        primary: "#0fc",
        secondary: "#0cf",
        highlight: "#f0c",
        muted: "#011",
      },
    },
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  ...typography,
  ...componentThemes,
};
