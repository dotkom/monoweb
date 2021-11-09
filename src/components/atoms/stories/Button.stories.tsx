import Button from "../Button";

export default {
  title: "atoms/Button",
  component: Button,
};

export const primaryButton = () => <Button variant="primary">Default button</Button>;
export const secondaryButton = () => <Button variant="secondary">Default button</Button>;
