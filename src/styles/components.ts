import type { Theme } from "theme-ui";

export const componentsTheme: Theme = {
  buttons: {
    base: {
      borderRadius: "4px",
      transition: "0.2s ease-in-out",
      cursor: "pointer",
    },
    primary: {
      variant: "buttons.base",
      bg: "#153e75",
      "&:hover": {
        bg: "#2c5183",
        transform: "translateY(-1px)",
      },
      "&:active": {
        bg: "#133869",
        transform: "translateY(2px)",
      },
    },
    secondary: {
      variant: "buttons.base",
      bg: "#F98B00",
      "&:hover": {
        bg: "#fa971a",
        transform: "translateY(-1px)",
      },
      "&:active": {
        bg: "#e07d00",
        transform: "translateY(2px)",
      },
    },
  },
};
