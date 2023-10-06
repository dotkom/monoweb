import { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Textarea",
  component: Textarea,
};
export default meta;

type Story = StoryObj<typeof Textarea>;
export const Default: Story = { args: { placeholder: "Write a love letter to Online." } };

export const Disabled: Story = {
  ...Default,
  args: { ...Default.args, disabled: true },
};

export const Label: Story = {
  ...Default,
  args: { ...Default.args, label: "What's your thought's?" },
};

export const Status: Story = {
  ...Default,
  args: {
    ...Default.args,
    label: "What's your thought's?",
    message: "This is a message",
  },
  render: (args) => (
    <div className="grid gap-4">
      <Textarea {...args} status="success" />
      <Textarea {...args} status="warning" />
      <Textarea {...args} status="danger" />
    </div>
  ),
};

export const Error: Story = {
  ...Default,
  args: {
    ...Default.args,
    error:
      "A valid email address is required so that we can verify your GitHub installation. In the event that you cannot provide a valid email address, please contact support.",
  },
};
