import { Circle } from "../Circle";

export default {
  title: "atoms/Circle",
  component: Circle,
};

export const Medium = () => (
  <Circle size={50} color={"$blue3"}>
    1
  </Circle>
);
export const Large = () => (
  <Circle size={500} color={"$red3"}>
    2
  </Circle>
);
export const Tiny = () => (
  <Circle size={25} color={"$orange3"}>
    3
  </Circle>
);
