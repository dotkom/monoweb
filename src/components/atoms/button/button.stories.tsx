import { Button, ButtonProps } from "theme-ui";
import { Story } from "@storybook/react";

export default {
  title: "Button",
  component: Button,
};

export const defaultButton = (props: ButtonProps) => <Button variant="primary">Default button</Button>;
