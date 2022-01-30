import { Circle } from "../atoms/Circle";
import { DottedCurve } from "../atoms/DottedCurve";
import React from "react";

interface ConnectedCircleProps {
  size: any;
  color: any;
}

export const ConnectedCircles: React.FC<ConnectedCircleProps> = ({ size, color }) => {
  return (
    <div>
      <Circle size={size} color={color}>
        1
      </Circle>
      <div>
        <DottedCurve color={color} size={"10vw"}></DottedCurve>
      </div>
      <Circle size={size} color={color}>
        2
      </Circle>
      <div>
        <DottedCurve color={color} size={"10vw"}></DottedCurve>
      </div>
      <Circle size={size} color={color}>
        3
      </Circle>
      <div>
        <DottedCurve color={color} size={"10vw"}></DottedCurve>
      </div>
      <Circle size={size} color={color}>
        4
      </Circle>
    </div>
  );
};

export default ConnectedCircles;
