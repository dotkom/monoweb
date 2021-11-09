import { Theme } from "theme-ui";

// TODO Add shared forms styles here and spread them

const forms: Theme["forms"] = {
  input: {
    borderColor: "gray",
    "&:focus": {
      boxShadow: (theme) => `0 0 0 1px ${theme.colors?.onlineBlue}`,
      transition: "0.3s ease-in-out",
      outline: "none",
    },
  },
  textarea: {
    borderColor: "gray",
    "&:focus": {
      borderColor: "primary",
      outline: "none",
    },
  },
  select: {
    borderColor: "gray",
    "&:focus": {
      borderColor: "primary",
      outline: "none",
    },
  },
  checkbox: {
    borderColor: "blue",
    cursor: "pointer",
  },
  radio: {
    borderColor: "blue",
    cursor: "pointer",
  },
};

export default forms;
