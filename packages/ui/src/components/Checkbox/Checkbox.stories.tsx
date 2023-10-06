import { StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

export default {
  title: "Checkbox",
  component: Checkbox,
};

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(true);
    return (
      <div style={{ padding: "40px" }}>
        <Checkbox {...args} checked={checked} onCheckedChange={(checked) => setChecked(!!checked)} />
      </div>
    );
  },
  args: { label: "I accept terms and conditions.", id: "default" },
};

export const Disabled: Story = {
  ...Default,
  args: { ...Default.args, disabled: true, id: "disabled" },
};

const checkboxes = [
  { label: "Receive email notifications", checked: false, id: "checkbox1" },
  { label: "Receive sms notifications", checked: false, id: "checkbox2" },
  { label: "Receive push notifications", checked: false, id: "checkbox3" },
];

export const Intermediate = () => {
  const [values, setValues] = useState(checkboxes.map((item) => item.checked));
  const allChecked = values.every((value) => value);
  const indeterminate = values.some((value) => value) && !allChecked;

  const handleIndeterminate = () => {
    if (!allChecked) {
      setValues([true, true, true]);
    } else {
      setValues([false, false, false]);
    }
  };

  return (
    <div className="grid gap-2">
      {JSON.stringify(values)}
      <Checkbox
        label="select all"
        checked={indeterminate ? "indeterminate" : allChecked}
        onCheckedChange={handleIndeterminate}
        id="intermediate"
      />
      <div className="ml-7 grid gap-1.5">
        {checkboxes.map((item, index) => (
          <Checkbox
            key={item.id}
            label={item.label}
            checked={values[index]}
            id={item.id}
            onCheckedChange={(e) => {
              setValues((values) => {
                const newValues = [...values];
                newValues[index] = !newValues[index];
                return newValues;
              });
            }}
          />
        ))}
      </div>
    </div>
  );
};

// export const Default = Template.bind({})
// Default.args = {}

// export const Disabled = Template.bind({})
// Disabled.args = { label: "I accept terms and conditions.", disabled: true, id: "disabled" }
