import type { Theme } from "theme-ui";

const select: Theme["forms"] = {
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

export default select;
