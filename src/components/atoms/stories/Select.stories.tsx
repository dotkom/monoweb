import { Select } from "theme-ui";

export default {
  title: "atoms/forms/Select",
  component: Select,
};

export const select = () => (
  <Select defaultValue="Hello">
    <option>Hello</option>
    <option>Hi</option>
    <option>Beep</option>
    <option>Boop</option>
  </Select>
);
