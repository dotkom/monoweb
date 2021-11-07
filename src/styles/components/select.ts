import type { Theme } from "theme-ui";

const selectTheme: Theme = {
  forms: {
    select: {
      borderColor: "gray",
      "&:focus": {
        borderColor: "primary",
        outline: "none",
      },
    },
  },
};

export default selectTheme;
