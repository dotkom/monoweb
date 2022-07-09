import { styled } from "../../config/stitches.config"

const Button = styled("button", {
  border: "none",
  borderRadius: "$2",
  cursor: "pointer",
  px: "16px",
  py: "10px",
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "0.2s ease-in-out",
  color: "$white",
  "&:hover": {
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(2px)",
  },
  variants: {
    color: {
      blue: {
        $$main: "$colors$blue3",
        "&:hover": { backgroundColor: "$blue6" },
        "&:active": { backgroundColor: "$blue7" },
      },
      green: {
        $$main: "$colors$green5",
        "&:hover": { backgroundColor: "$green6" },
        "&:active": { backgroundColor: "$green7" },
      },
      red: {
        $$main: "$colors$red5",
        "&:hover": { backgroundColor: "$red6" },
        "&:active": { backgroundColor: "$red7" },
      },
      orange: {
        $$main: "$colors$orange5",
        "&:hover": { backgroundColor: "$orange6" },
        "&:active": { backgroundColor: "$orange7" },
      },
      gray: {
        $$main: "$colors$gray5",
        "&:hover": { backgroundColor: "$gray6" },
        "&:active": { backgroundColor: "$gray7" },
      },
      info: {
        $$main: "$colors$info5",
        "&:hover": { backgroundColor: "$info6" },
        "&:active": { backgroundColor: "$info7" },
      },
    },
    variant: {
      solid: {
        color: "$white",
        bg: "$$main",
      },
      subtle: {
        color: "$$main",
        bg: "$$secondary",
      },
    },
  },
})

export default Button
