import { styled } from "@theme";
import React from "react";

export const Circle = styled("div", {
  display: "inline-flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
  borderRadius: "50%",
  margin: 0,
  variants: {
    color: {
      blue: {
        backgroundColor: "$blue2",
        color: "$white",
        display: "inline-flex",
        flexDirection: "column",
        justifyContent: "center",
      },
      red: {
        backgroundColor: "$red3",
        color: "$white",
      },
      orange: {
        backgroundColor: "$orange3",
        color: "$white",
      },
    },
    size: {
      small: {
        width: "5vw",
        height: "5vw",
        fontSize: "3vw",
      },
      medium: {
        width: "10vw",
        height: "10vw",
        fontSize: "5vw",
      },
      large: {
        width: "15vw",
        height: "15vw",
        fontSize: "10vw",
      },
    },
  },
  defaultVariants: {
    color: "blue",
    size: "medium",
  },
});

export default Circle;
