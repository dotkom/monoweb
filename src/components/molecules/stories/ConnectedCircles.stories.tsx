import {ConnectedCircles} from "../ConnectedCircles";

export default {
    title: "molecules/ConnectedCircle",
    component: ConnectedCircles,
};

export const Primary = () => <ConnectedCircles size={500} lineColor={"pink"}
                                               circleColor={"orange.1"}></ConnectedCircles>;
export const Smaller = () => <ConnectedCircles size={300} lineColor={"blue"} circleColor={"blue.1"}></ConnectedCircles>;
export const Large = () => <ConnectedCircles size={1200} lineColor={"green"} circleColor={"red.1"}></ConnectedCircles>;
