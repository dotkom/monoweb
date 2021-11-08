import type { Theme } from "theme-ui";
import { darken, lighten } from "@theme-ui/color";

const getVariants = (color: string) => ({
  subtle: {
    variant: "badges.base",
    bg: "background",
    color: darken(color, 0.02),
    border: "1px solid",
    borderColor: darken(color, 0.02),
  },
  solid: {
    variant: "badges.base",
    color: "background",
    bg: darken(color, 0.02),
  },
  outline: {
    variant: "badges.base",
    color: darken(color, 0.1),
    bg: lighten(color, 0.6),
  },
});

const badges: Theme["badges"] = {
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
  green: getVariants("green"),
  blue: getVariants("blue"),
  red: getVariants("red"),
  grey: getVariants("grey"),
  purple: getVariants("purple"),
};

export default badges;
/*
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
*/
