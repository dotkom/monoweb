import { Button, ButtonProps } from "theme-ui";

export default {
  title: "atoms/Button",
  component: Button,
};

export const defaultButton = (props: ButtonProps) => <Button>Default button</Button>;
export const orangeButton = (props: ButtonProps) => <Button variant="orange">Orange Button</Button>;
export const greenButton = (props: ButtonProps) => <Button variant="green">Green Button</Button>;
export const redButton = (props: ButtonProps) => <Button variant="red">Red Button</Button>;
