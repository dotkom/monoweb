import type { Theme } from "theme-ui";

const inputTheme: Theme = {
  forms: {
    input: {
      borderColor: "gray",
      "&:focus": {
        borderColor: "primary",
        boxShadow: (theme) => `0 0 0 1px ${theme.colors?.onlineBlue}`,
        outline: "none",
      },
    },
  },
};

export default inputTheme;
