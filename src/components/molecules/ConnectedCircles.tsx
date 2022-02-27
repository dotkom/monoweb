/** @jsxImportSource theme-ui */

import Box, { Flex } from "@components/particles/Box";
import { Circle } from "../atoms/Circle";
import { DottedCurve } from "../atoms/DottedCurve";

interface ConnectedCircleProps {
  color: "yellow" | "blue" | "red";
  steps: string[];
}

export const ConnectedCircles: React.FC<ConnectedCircleProps> = ({ color, steps }) => {
  return (
    <Flex css={{ fontSize: "1.2vw", justifyContent: "center", textAlign: "center", paddingTop: "5vw" }}>
      <Flex css={{ width: "7vw", justifyContent: "top", flexDirection: "column" }}>
        <Flex css={{ justifyContent: "center" }}>
          <Circle size={"small"} color={color}>
            1
          </Circle>
        </Flex>
        <Box css={{ display: "inline" }}>{steps[0]}</Box>
      </Flex>
      <Flex css={{ width: "11vw", justifyContent: "top", margin: " 0 -0.5vw 0 -0.5vw" }}>
        <DottedCurve color={color} size={"small"}></DottedCurve>
      </Flex>
      <Flex css={{ width: "7vw", justifyContent: "top", flexDirection: "column" }}>
        <Flex css={{ justifyContent: "center" }}>
          <Circle size={"small"} color={color}>
            2
          </Circle>
        </Flex>
        <Box css={{ display: "inline" }}>{steps[1]}</Box>
      </Flex>
      <Flex css={{ width: "11vw", justifyContent: "top", margin: " 0 -0.5vw 0 -0.5vw" }}>
        <DottedCurve color={color} size={"small"} flipped={true}></DottedCurve>
      </Flex>
      <Flex css={{ width: "7vw", justifyContent: "top", flexDirection: "column" }}>
        <Flex css={{ justifyContent: "center" }}>
          <Circle size={"small"} color={color}>
            3
          </Circle>
        </Flex>
        <Box css={{ display: "inline" }}>{steps[2]}</Box>
      </Flex>
      <Flex css={{ width: "11vw", justifyContent: "top", margin: " 0 -0.5vw 0 -0.5vw" }}>
        <DottedCurve color={color} size={"small"}></DottedCurve>
      </Flex>
      <Flex css={{ width: "7vw", justifyContent: "top", flexDirection: "column" }}>
        <Flex css={{ justifyContent: "center" }}>
          <Circle size={"small"} color={color}>
            4
          </Circle>
        </Flex>
        <Box css={{ display: "inline" }}>{steps[3]}</Box>
      </Flex>
    </Flex>
  );
};

export default ConnectedCircles;
