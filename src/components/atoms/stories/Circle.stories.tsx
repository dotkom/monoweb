import { Circle } from "../Circle";

export default {
  title: "atoms/Circle",
  component: Circle,
};

export const Medium = () => (
  <Circle size={"medium"} color={"blue"}>
    1
  </Circle>
);
export const Large = () => (
  <Circle size={"large"} color={"red"}>
    2
  </Circle>
);
export const Tiny = () => (
  <Circle size={"small"} color={"orange"}>
    3
  </Circle>
);