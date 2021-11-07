import type { Theme } from "theme-ui";

const inputTheme: Theme = {
  forms: {
    input: {
      borderColor: "gray",
      "&:focus": {
        borderColor: "primary",
        boxShadow: `0 0 0 2px #888`,
        outline: "none",
      },
    },
  },
};

export default inputTheme;
