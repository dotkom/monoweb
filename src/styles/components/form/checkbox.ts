import type { Theme } from "theme-ui";

const checkbox: Theme["forms"] = {
  forms: {
    checkbox: {
      borderColor: "blue",
      "&:hover": {
        cursor: "pointer",
      },
    },
  },
};

export default checkbox;
