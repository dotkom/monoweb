import type { Theme } from "theme-ui";
import { darken, lighten } from "@theme-ui/color";

export const badges: Theme["badges"] = {
  base: {
    borderRadius: "2px",
    fontWeight: 900,
    fontSize: "20px",
  },
  test: {
    variant: "badges.base",
    bg: "background",
    color: darken("green", 0.02),
    border: "1px solid",
    borderColor: darken("green", 0.02),
  },
};

const colors = ["green", "blue", "red", "grey", "purple"];
for (const i of colors) {
  badges[i] = {
    subtle: {
      variant: "badges.base",
      bg: "background",
      color: darken(i, 0.02),
      border: "1px solid",
      borderColor: darken(i, 0.02),
    },
    solid: {
      variant: "badges.base",
      color: "background",
      bg: darken(i, 0.02),
    },
    outline: {
      variant: "badges.base",
      color: darken(i, 0.1),
      bg: lighten(i, 0.6),
    },
  };
}
