import { StoryObj } from "@storybook/react"
import { Label } from "./Label"

export default {
  title: "Label",
  component: Label,
}
type Story = StoryObj<typeof Label>

export const Default: Story = {
  render: (args) => {
    return <Label {...args} />
  },
  args: { id: "airplane-mode", children: "Airplane mode" },
}
