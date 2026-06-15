import type { Story, StoryDefault } from "@ladle/react"
import type { ComponentProps } from "react"
import { Label } from "./Label"

type LabelProps = ComponentProps<typeof Label>

export default {
  title: "Label",
} satisfies StoryDefault<LabelProps>

export const Default: Story<LabelProps> = (args) => {
  return <Label {...args} />
}
Default.args = { id: "airplane-mode", children: "Airplane mode" }
