import {ConnectedCircles} from "../ConnectedCircles";

export default {
    title: "molecules/ConnectedCircle",
    component: ConnectedCircles,
};

export const Primary = () => <ConnectedCircles size={500}></ConnectedCircles>;
export const Smaller = () => <ConnectedCircles size={300}></ConnectedCircles>;
export const Large = () => <ConnectedCircles size={1200}></ConnectedCircles>;