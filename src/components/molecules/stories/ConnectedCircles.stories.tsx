import { ConnectedCircles } from "../ConnectedCircles";

export default {
  title: "molecules/ConnectedCircle",
  component: ConnectedCircles,
};

export const Small = () => <ConnectedCircles size={"small"} color={"blue"}></ConnectedCircles>;
export const Medium = () => <ConnectedCircles size={"medium"} color={"yellow"}></ConnectedCircles>;
export const Large = () => <ConnectedCircles size={"large"} color={"red"}></ConnectedCircles>;
