import { styled } from "@theme"

export const FooterSection = styled("div", {
  textAlign: "center",
  margin: "auto",

  variants: {
    marginSize: {
      small: {
        marginBottom: "0.5em",
      },
      medium: {
        marginBottom: "1.8em",
      },
    },
  },
})
