import { Checkbox, CheckboxProps, Label } from "theme-ui";

export default {
  title: "Checkbox",
  component: Checkbox,
};

export const checkbox = (props: CheckboxProps) => (
    <Label>
        <Checkbox defaultChecked={true} />
    </Label>
) 