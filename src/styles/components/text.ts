import { Theme } from "theme-ui";

const text: Theme["text"] = {
  base: {
    fontFamily: "body",
    fontSize: 16,
  },
  emphasis: {
    variant: "text.base",
    fontWeight: "bold",
  },
  italic: {
    variant: "text.base",
    fontStyle: "italic",
  },
  strikethrough: {
    variant: "text.base",
    textDecoration: "line-through",
  },
  underline: {
    variant: "text.base",
    textDecoration: "underline",
  },
};

export default text;
