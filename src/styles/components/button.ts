import type { Theme } from "theme-ui";

const getButtonColors = (variant: string) => ({
  variant: "buttons.base",
  bg: variant,
  "&:hover": {
    bg: `${variant}.light`,
    transform: "translateY(-1px)",
  },
  "&:active": {
    bg: `${variant}.dark`,
    transform: "translateY(2px)",
  },
});

export const buttonTheme: Theme = {
  buttons: {
    base: {
      borderRadius: "4px",
      transition: "0.2s ease-in-out",
      cursor: "pointer",
    },
    primary: getButtonColors("primary"),
    secondary: getButtonColors("secondary"),
  },
};
