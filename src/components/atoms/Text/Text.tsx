import { styled } from "@theme";

const Text = styled("p", {
  fontSize: "14px",
  variants: {
    size: {
      xs: {
        fontSize: "8px",
      },
      sm: {
        fontSize: "10px",
      },
      md: {
        fontSize: "12px",
      },
      lg: {
        fontSize: "16px",
      },
      xl: {
        fontSize: "24px",
      },
      "2xl": {
        fontSize: "32px",
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
});

export default Text;
