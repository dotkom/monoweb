import { Meta, Story } from "@storybook/react";
import Checkbox from "../Checkbox";
import Label from "../Label";

export default {
  title: "atoms/forms/Checkbox",
  component: Checkbox,
} as Meta;

const checkbox = () => <Checkbox defaultChecked={true} />;
