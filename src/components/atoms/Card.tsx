import { styled } from "@theme";

const Card = styled("div", {
  boxSizing: "border-box",
  margin: 0,
  minWidth: 0,
  borderRadius: "$3",
  p: 32,
  variants: {
    shadow: {
      true: {
        boxShadow:
          "1.1px 0.6px 5.2px -5px rgba(0, 0, 0, 0.022),2.4px 1.2px 13px -5px rgba(0, 0, 0, 0.031),4.4px 2.2px 26.6px -5px rgba(0, 0, 0, 0.039),9px 4.5px 54.8px -5px rgba(0, 0, 0, 0.048),40px 20px 150px -5px rgba(0, 0, 0, 0.07)",
      },
    },
    outlined: {
      true: {
        border: "1px solid $gray12",
      },
    },
  },
  defaultVariants: {
    outlined: true,
  },
});

export default Card;
