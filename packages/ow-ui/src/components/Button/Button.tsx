import { styled } from "../../config/stitches.config"

const Button = styled("button", {
  border: "none",
  borderRadius: "$2",
  cursor: "pointer",
  px: "14px",
  py: "8px",
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-1px)",
    filter: "brightness(120%)",
  },
  "&:active": {
    transform: "translateY(2px)",
    filter: "brightness(130%)",
  },
  color: "$white",
  $$main: "$colors$blue3",
  $$secondary: "$colors$blue11",
  bg: "$$main",
  variants: {
    subtle: {
      gray: {
        color: "$gray3",
        backgroundColor: "transparent",
        "&:hover": { color: "$gray1", backgroundColor: "transparent" },
        "&:active": { backgroundColor: "transparent" },
      },
    },
    color: {
      blue: {
        $$main: "$colors$blue3",
        $$secondary: "$colors$blue11",
      },
      green: {
        $$main: "$colors$green3",
        $$secondary: "$colors$green11",
      },
      red: {
        $$main: "$colors$red3",
        $$secondary: "$colors$red11",
      },
      orange: {
        $$main: "$colors$orange3",
        $$secondary: "$colors$orange11",
      },
      gray: {
        $$main: "$colors$gray3",
        $$secondary: "$colors$gray11",
      },
      info: {
        $$main: "$colors$info3",
        $$secondary: "$colors$info11",
      },
    },
    variant: {
      solid: {
        color: "$white",
        bg: "$$main",
        "&:hover": { filter: "brightness(120%)" },
        "&:active": { filter: "brightness(130%)" },
      },
      subtle: {
        color: "$$main",
        bg: "$$secondary",
        "&:hover": { filter: "brightness(105%)" },
        "&:active": { filter: "brightness(110%)" },
      },
      tertiary: {
        color: "$$main",
        bg: "transparent",
      },
    },
  },
})

export default Button
