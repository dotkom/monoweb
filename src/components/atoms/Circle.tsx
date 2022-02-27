import Box from "@components/particles/Box";
import { styled } from "@theme";

export const Circle = styled(Box, {
  borderRadius: "$round",
  display: "inline-flex",
  textAlign: "center",
  flexDirection: "column",
  justifyContent: "center",
  float: "left",
  margin: 0,
  variants: {
    color: {
      blue: {
        backgroundColor: "$blue3",
        color: "$white",
      },
      yellow: {
        backgroundColor: "$orange3",
        color: "$white",
      },
      red: {
        backgroundColor: "$red2",
        color: "$white",
      },
    },
    size: {
      small: {
        width: "5vw",
        height: "5vw",
        fontSize: "3.5vw",
      },
      medium: {
        width: "10vw",
        height: "10vw",
        fontSize: "7vw",
      },
      large: {
        width: "15vw",
        height: "15vw",
        fontSize: "10.5vw",
      },
    },
  },
});

export default Circle;
