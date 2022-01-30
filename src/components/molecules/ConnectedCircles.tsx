import { Box, ThemeUICSSObject } from "theme-ui";
import { Circle } from "../atoms/Circle";
import { DottedLine } from "../atoms/DottedCurve";

const style: ThemeUICSSObject = {
  float: "left",
  transform: "rotate(45deg)",
  position: "relative",
};

interface ConnectedCircleProps {
  size: number;
  lineColor: string;
  circleColor: string;
}

export const ConnectedCircles: React.FC<ConnectedCircleProps> = ({ size, lineColor, circleColor }) => {
  const dynamicSize = size / 50 + "vw";
  return (
    <div>
      <Circle size={size / 12} color={circleColor}>
        1
      </Circle>
      <Box sx={{ ...style, width: dynamicSize, marginTop: -(size / 250) + "vw" }}>
        {" "}
        <DottedLine color={lineColor}></DottedLine>
      </Box>
      <Circle size={size / 12} color={circleColor}>
        2
      </Circle>
      <Box sx={{ ...style, transform: "rotate(-135deg)", width: dynamicSize, marginTop: -(size / 100) + "vw" }}>
        <DottedLine color={lineColor}></DottedLine>
      </Box>
      <Circle size={size / 12} color={circleColor}>
        3
      </Circle>
      <Box sx={{ ...style, width: dynamicSize, marginTop: -(size / 250) + "vw" }}>
        <DottedLine color={lineColor}></DottedLine>
      </Box>
      <Circle size={size / 12} color={circleColor}>
        4
      </Circle>
    </div>
  );
};

export default ConnectedCircles;
