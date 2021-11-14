import { Box, ThemeUICSSObject } from "theme-ui";
import { Circle } from "../atoms/Circle";

const Dotted = (
  <svg
    version="1.0"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    width="480px"
    height="480px"
    viewBox="0 0 480 480"
    enable-background="new 0 0 480 480"
    style={{ width: "100%" }}
  >
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="436.1"
      y1="76"
      x2="435.9"
      y2="100.4"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="434.8"
      y1="113.7"
      x2="430.7"
      y2="137.7"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="428.4"
      y1="151.7"
      x2="422.2"
      y2="175.3"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="417.2"
      y1="190.6"
      x2="408.5"
      y2="213.3"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="403.1"
      y1="225.6"
      x2="391.5"
      y2="247"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="384.3"
      y1="259.3"
      x2="371"
      y2="279.7"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="362.2"
      y1="290.8"
      x2="346.8"
      y2="309.7"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="336.8"
      y1="320.5"
      x2="318.5"
      y2="336.6"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="308.5"
      y1="345.7"
      x2="288.7"
      y2="359.9"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="277.3"
      y1="367.9"
      x2="256.1"
      y2="379.8"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="243.4"
      y1="386.5"
      x2="221.2"
      y2="396.5"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="207.6"
      y1="401.6"
      x2="184.5"
      y2="409"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="171.1"
      y1="412.2"
      x2="147.2"
      y2="416.9"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="133.2"
      y1="418.6"
      x2="108.9"
      y2="420.5"
    />
    <line
      fill="none"
      stroke="#000000"
      stroke-width="5"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-miterlimit="10"
      x1="92.1"
      y1="420.6"
      x2="67.8"
      y2="420.6"
    />
  </svg>
);

const style: ThemeUICSSObject = {
  width: "200px",
  float: "left",
  marginTop: "-205px",
  transform: "rotate(45deg)",
};

export const ConnectedCircles: React.FC = () => {
  return (
    <div style={{ textAlign: "left" }}>
      <Circle size={50}>1</Circle>
      <Box sx={{ ...style }}>{Dotted}</Box>
      <Circle size={50}>2</Circle>
      <Box sx={{ ...style, transform: "rotate(-135deg)", marginTop: "-235px" }}>{Dotted}</Box>
      <Circle size={50}>3</Circle>
      <Box sx={{ ...style }}>{Dotted}</Box>
      <Circle size={50}>4</Circle>
    </div>
  );
};

export default ConnectedCircles;
