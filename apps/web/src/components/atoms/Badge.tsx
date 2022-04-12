import { styled } from "@theme";

const Badge = styled("span", {
  borderRadius: "$2",
  fontWeight: "600",
  padding: "0 0.5rem",
  display: "inline-block",
  variants: {
    color: {
      green: {
        $$main: "#43B171",
        $$secondary: "#D9EFE3",
      },
      gray: {
        $$main: "#718096",
        $$secondary: "#EDF2F7",
      },
      blue: {
        $$main: "#2544da",
        $$secondary: "#bac4f3",
      },
      red: {
        $$main: "#EB536E",
        $$secondary: "#FBDDE2",
      },
      orange: {
        $$main: "#FEB515",
        $$secondary: "#FFF0D0",
      },
    },
    variant: {
      solid: {
        color: "$white",
        bg: "$$main",
      },
      outline: {
        bg: "none",
        color: "$$main",
        border: "1px solid $$main",
      },
      subtle: {
        color: "$$main",
        bg: "$$secondary",
      },
    },
  },
});

export default Badge;
