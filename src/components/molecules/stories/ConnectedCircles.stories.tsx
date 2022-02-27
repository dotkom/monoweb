import { ConnectedCircles } from "../ConnectedCircles";

export default {
  title: "molecules/ConnectedCircle",
  component: ConnectedCircles,
};

export const Small = () => (
  <ConnectedCircles
    color={"blue"}
    steps={["Kartlegging", "Intern Planlegging", "Tilbud", "Sammarbeid"]}
  ></ConnectedCircles>
);
