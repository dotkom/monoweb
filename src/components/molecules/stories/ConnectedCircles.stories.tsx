import { ConnectedCircles } from "../ConnectedCircles";

export default {
  title: "molecules/ConnectedCircle",
  component: ConnectedCircles,
};

export const Primary = () => <ConnectedCircles size={"small"} color={"orange"}/>;
export const Smaller = () => <ConnectedCircles size={"medium"} color={"blue"}/>;
export const Large = () => <ConnectedCircles size={"large"} color={"red"}/>;
