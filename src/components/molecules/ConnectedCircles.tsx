/** @jsxImportSource theme-ui */

import { Box, ThemeUICSSObject } from "theme-ui";
import { Circle } from "../atoms/Circle";
import { DottedCurve } from "../atoms/DottedCurve";

interface ConnectedCircleProps {
  size: "small" | "medium" | "large";
  color: "yellow" | "blue" | "red";
}

export const ConnectedCircles: React.FC<ConnectedCircleProps> = ({ size, color }) => {
  return (
    <div>
      <Circle size={size} color={color}>
        1
      </Circle>
      <div>
        <DottedCurve color={color} size={size}></DottedCurve>
      </div>
      <Circle size={size} color={color}>
        2
      </Circle>
      <div>
        <DottedCurve color={color} size={size} flipped={true}></DottedCurve>
      </div>
      <Circle size={size} color={color}>
        3
      </Circle>
      <div>
        <DottedCurve color={color} size={size}></DottedCurve>
      </div>
      <Circle size={size} color={color}>
        4
      </Circle>
    </div>
  );
};

export default ConnectedCircles;
