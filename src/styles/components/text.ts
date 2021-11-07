import { Theme } from "theme-ui";

export const text: Theme["text"] = {
  text: {
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
  },
};
