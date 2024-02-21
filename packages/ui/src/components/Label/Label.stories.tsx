import { Story, StoryDefault } from "@ladle/react"
import { Label } from "./Label"
import { LabelProps } from "@radix-ui/react-label"

export default {
  title: "Label",
} satisfies StoryDefault<LabelProps>

export const Default: Story<LabelProps> = (args) => {
  return <Label {...args} />
}
Default.args = { id: "airplane-mode", children: "Airplane mode" }
