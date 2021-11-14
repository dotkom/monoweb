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
  return (
    <div style={{ width: size }}>
      <Circle size={size / 15} color={circleColor}>
        1
      </Circle>
      <Box sx={{ ...style, width: size / 5, marginTop: -(size / 25) }}>
        {" "}
        <DottedLine color={lineColor}></DottedLine>
      </Box>
      <Circle size={size / 15} color={circleColor}>
        2
      </Circle>
      <Box sx={{ ...style, transform: "rotate(-135deg)", width: size / 5, marginTop: -(size / 11) - 10 }}>
        <DottedLine color={lineColor}></DottedLine>
      </Box>
      <Circle size={size / 15} color={circleColor}>
        3
      </Circle>
      <Box sx={{ ...style, width: size / 5, marginTop: -(size / 25) }}>
        <DottedLine color={lineColor}></DottedLine>
      </Box>
      <Circle size={size / 15} color={circleColor}>
        4
      </Circle>
    </div>
  );
};

export default ConnectedCircles;
