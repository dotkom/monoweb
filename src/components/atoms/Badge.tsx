import { styled } from "@theme";

const getVariant = () => ({
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
    subtle: {
      bg: "none",
      color: "$$main",
      border: "1px solid",
      borderColor: "$$main",
    },
    outline: {
      color: "$$main",
      bg: "$$secondary",
    },
  },
});

const Badge = styled("p", {
  borderRadius: "5px",
  fontWeight: "600",
  padding: "0 0.5rem",
  display: "inline-block",
  variants: getVariant(),
});

export default Badge;