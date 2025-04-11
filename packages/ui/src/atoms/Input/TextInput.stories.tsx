import type { Story } from "@ladle/react"
import { TextInput } from "./TextInput"

export default {
  title: "TextInput",
}

export const Template: Story = () => <TextInput id="name" label="Full name" />
export const Required: Story = () => <TextInput id="name" label="Full name" required />
export const Placeholder: Story = () => <TextInput id="name" label="Full name" placeholder="Chad Thunder" />
export const WithError: Story = () => <TextInput id="name" label="Full name" value="Invalid text" error />
export const ErrorWithMessage: Story = () => (
  <TextInput id="name" label="Full name" value="Invalid text" error="Too short" />
)
export const Disabled: Story = () => <TextInput id="name" label="Full name" disabled />
