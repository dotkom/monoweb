import { styled } from "../../config/stitches.config"

const Badge = styled("span", {
  borderRadius: "$2",
  padding: "0 0.5rem",
  display: "inline-block",
  variants: {
    color: {
      green: {
        $$main: "$colors$green2",
        $$secondary: "$colors$green11",
      },
      gray: {
        $$main: "$colors$gray4",
        $$secondary: "$colors$gray11",
      },
      blue: {
        $$main: "$colors$info2",
        $$secondary: "$colors$info11",
      },
      red: {
        $$main: "$colors$red4",
        $$secondary: "$colors$red11",
      },
      orange: {
        $$main: "$colors$orange3",
        $$secondary: "$colors$orange11",
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
