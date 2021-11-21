import type { Theme } from "theme-ui";
import { saturate } from "@theme-ui/color";

const getVariants = (color: string) => ({
  subtle: {
    variant: "badges.base",
    bg: "background",
    color: saturate(`${color}.2`, 0.2),
    border: "1px solid",
    borderColor: saturate(`${color}.2`, 0.3),
  },
  solid: {
    variant: "badges.base",
    color: "background",
    bg: saturate(`${color}.2`, 0.1),
  },
  outline: {
    variant: "badges.base",
    color: saturate(`${color}.2`, 0.3),
    bg: `${color}.9`,
  },
});

const badges: Theme["badges"] = {
  base: {
    borderRadius: "5px",
    fontWeight: "600",
    paddingX: 2,
  },
  green: getVariants("green"),
  gray: getVariants("gray"),
  blue: getVariants("blue"),
  red: getVariants("red"),
  orange: getVariants("orange"),
};

export default badges;
