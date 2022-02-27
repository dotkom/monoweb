import dynamic from "next/dynamic";
import { Circle } from "../Circle";

export default {
  title: "atoms/Circle",
  component: Circle,
};

export const Small = () => (
  <Circle size={"small"} color={"blue"}>
    1
  </Circle>
);
export const Medium = () => (
  <Circle size={"medium"} color={"red"}>
    2
  </Circle>
);
export const Large = () => (
  <Circle size={"large"} color={"yellow"}>
    3
  </Circle>
);
