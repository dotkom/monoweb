import { Button, ButtonProps } from "theme-ui";

export default {
  title : "atoms/Button",
  component: Button,
};

export const primaryButton = (props: ButtonProps) => <Button variant="primary">Default button</Button>;
export const secondaryButton = (props: ButtonProps) => <Button variant="secondary">Default button</Button>;
