import { styled } from "@theme"

export const Link = styled("a", {
  fontSize: "1.2em",
  padding: "1px 10px",
  cursor: "pointer",

  textDecoration: "none",

  variants: {
    type: {
      main: {
        fontWeight: "bold",
        fontSize: "1.5em",
        "&:hover": {
          textDecoration: "underline",
        },
      },
      secondary: {
        "&:not(:last-of-type)": {
          borderRight: "solid 2px White",
        },
      },
    },
  },
})
