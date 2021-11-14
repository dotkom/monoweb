import type { Theme } from "theme-ui";
import { darken, lighten } from "@theme-ui/color";

const getVariants = (color: string) => ({
  subtle: {
    variant: "badges.base",
    bg: "background",
    color: `${color}.3`,
    border: "1px solid",
    borderColor: `${color}.3`,
  },
  solid: {
    variant: "badges.base",
    color: "background",
    bg: `${color}.3`,
  },
  outline: {
    variant: "badges.base",
    color: `${color}.2`,
    bg: `${color}.8`,
  },
});

const badges: Theme["badges"] = {
  base: {
    borderRadius: "2px",
    fontWeight: "bold",
  },
  green: getVariants("green"),
  gray: getVariants("gray"),
  blue: getVariants("blue"),
  red: getVariants("red"),
  orange: getVariants("orange"),
};

export default badges;
