import type { Story } from "@ladle/react"
import { TextInput } from "./TextInput"

export default {
  title: "TextInput",
}

export const Default: Story = () => (
  <div className="flex flex-col gap-3">
    <TextInput id="name" label="Full name" placeholder="Ola Nordmann" />
    <TextInput id="name" label="Full name" required />
    <TextInput id="name" label="Full name" placeholder="Chad Thunder" />
    <TextInput id="name" label="Full name" value="Invalid text" error />
    <TextInput id="name" label="Full name" value="Invalid text" error="Too short" />
    <TextInput id="name" label="Full name" disabled />
  </div>
)
