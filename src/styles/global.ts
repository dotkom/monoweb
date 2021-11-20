import { ThemeStyles } from "theme-ui";

const globalStyles: ThemeStyles["root"] = {
  "html, body, #__next": {
    minHeight: "100vh",
    fontFamily: "body",
  },
  "#__next": {
    bg: "#ffffff",
  },
};

export default globalStyles;
