import { Select, SelectProps } from "theme-ui";

export default {
  title: "Select",
  component: Select,
};

export const select = (props: SelectProps) =>(
  <Select defaultValue="Hello">
    <option>Hello</option>
    <option>Hi</option>
    <option>Beep</option>
    <option>Boop</option>
  </Select> 
)