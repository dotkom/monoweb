import { Story, StoryDefault } from "@ladle/react"
import { Textarea, TextareaProps } from "./Textarea"

export default {
  title: "Textarea",
} satisfies StoryDefault

const Template: Story<TextareaProps> = (args) => <Textarea {...args} />

export const Default: Story<TextareaProps> = Template.bind({})
Default.args = { placeholder: "Write a love letter to Online.", disabled: false }

export const Disabled: Story<TextareaProps> = Template.bind({})
Default.args = { ...Default.args, disabled: true }

export const Label: Story<TextareaProps> = Template.bind({})
Default.args = { ...Default.args, label: "What's your thought's?" }

export const Status: Story<TextareaProps> = (args) => (
  <div className="grid gap-4">
    <Textarea {...args} status="success" />
    <Textarea {...args} status="warning" />
    <Textarea {...args} status="danger" />
  </div>
)

Status.args = {
  ...Default.args,
  label: "What's your thought's?",
  message: "This is a message",
}

export const Error: Story<TextareaProps> = Template.bind({})
Error.args = {
  ...Default.args,
  error:
    "A valid email address is required so that we can verify your GitHub installation. In the event that you cannot provide a valid email address, please contact support.",
}
