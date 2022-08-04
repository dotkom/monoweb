import { styled } from "../../config/stitches.config"

export const Text = styled("p", {
  fontSize: "14px",
  fontFamily: "$body",
  variants: {
    size: {
      xs: {
        fontSize: "$xs",
      },
      sm: {
        fontSize: "$sm",
      },
      md: {
        fontSize: "$md",
      },
      lg: {
        fontSize: "$lg",
      },
      xl: {
        fontSize: "$xl",
      },
      "2xl": {
        fontSize: "$2xl",
      },
    },
    truncate: {
      true: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
    },
  },
})
