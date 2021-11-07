import { Theme } from "theme-ui";

export const colors: Theme["colors"] = {
  text: "#000",
  background: "#fff",
  primary: { __default: "#153e75", light: "#2c5183", dark: "#133869" },
  secondary: { __default: "#F98B00", light: "#fa971a", dark: "#e07d00" },
  highlight: "#EFEFFE",
  muted: "#f6f6ff",
  onlineBlue: "#0D5474",
  onlineOrange: "#F9B759",
  modes: {
    dark: {
      text: "#fff",
      background: "#000",
      primary: "#0fc",
      secondary: "#0cf",
      highlight: "#EFEFFE",
      muted: "#011",
    },
  },
};
