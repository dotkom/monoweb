import { Radio, Label } from "theme-ui";

export default {
  title: "atoms/forms/Radio",
  component: Radio,
};

export const radio = () => (
  <>
    <Label>
      <Radio name="radioGroup" value="true" defaultChecked={true} />
      Radio 1
    </Label>
    <Label>
      <Radio name="radioGroup" value="false" />
      Radio 2
    </Label>
  </>
);
