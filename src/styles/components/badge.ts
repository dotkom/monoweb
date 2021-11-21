import type { Theme } from "theme-ui";

const getVariants = (color1: string, color2: string) => ({
  subtle: {
    variant: "badges.base",
    bg: "background",
    color: color2,
    border: "1px solid",
    borderColor: color2,
  },
  solid: {
    variant: "badges.base",
    color: "background",
    bg: color2,
  },
  outline: {
    variant: "badges.base",
    color: color2,
    bg: color1,
  },
});

const badges: Theme["badges"] = {
  base: {
    borderRadius: "5px",
    fontWeight: "600",
    paddingX: 2,
  },
  green: getVariants("#D9EFE3", "#43B171"),
  gray: getVariants("#EDF2F7", "#718096"),
  blue: getVariants("#bac4f3", "#2544da"),
  red: getVariants("#FBDDE2", "#EB536E"),
  orange: getVariants("#FFF0D0", "#FEB515"),
};
export default badges;
