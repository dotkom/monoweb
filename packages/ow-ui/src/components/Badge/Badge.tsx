import { styled } from "../../config/stitches.config"

const Badge = styled("span", {
  borderRadius: "$2",
  padding: "0 0.5rem",
  display: "inline-block",
  variants: {
    color: {
      green: {
        $$main: "$colors$green1",
        $$secondary: "#C3E8D8",
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
        $$main: "#F5A623",
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
})

export default Badge
