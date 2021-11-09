import { Button } from "theme-ui";

export default {
  title: "atoms/Button",
  component: Button,
};

export const Primary = () => <Button variant="primary">Default button</Button>;
export const Orange = () => <Button variant="Orange">Orange button</Button>;
export const Green = () => <Button variant="Green">Green button</Button>;
export const Red = () => <Button variant="Red">Red button</Button>;
export const Gray = () => <Button variant="gray">Gray Button</Button>;
