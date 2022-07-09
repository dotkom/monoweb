import Badge from "./Badge";
export default {
  title: "atoms/Badge",
  component: Badge,
};

export const Default = () => <Badge>badge</Badge>;
export const Orange = () => <Badge color="orange">badge</Badge>;
export const Green = () => <Badge color="green">badge</Badge>;
export const Red = () => <Badge color="red">badge</Badge>;
export const Gray = () => <Badge color="gray">badge</Badge>;
