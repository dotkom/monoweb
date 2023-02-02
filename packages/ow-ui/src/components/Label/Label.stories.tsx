import { StoryObj } from "@storybook/react"
import { Label } from "./Label"

export default {
  title: "atoms/Label",
  component: Label,
}
type Story = StoryObj<typeof Label>
export const Default: Story = {
  render: (args) => {
    return <Label {...args}>Airplane Mode</Label>
  },
  args: { id: "airplane-mode" },
}
