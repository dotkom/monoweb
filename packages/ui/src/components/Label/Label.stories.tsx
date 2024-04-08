import type { Story, StoryDefault } from "@ladle/react"
import type { LabelProps } from "@radix-ui/react-label"
import { Label } from "./Label"

export default {
  title: "Label",
} satisfies StoryDefault<LabelProps>

export const Default: Story<LabelProps> = (args) => {
  return <Label {...args} />
}
Default.args = { id: "airplane-mode", children: "Airplane mode" }
