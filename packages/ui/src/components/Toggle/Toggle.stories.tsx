import { Story } from "@ladle/react"
import { Label } from "../Label"
import { Toggle, ToggleProps } from "./Toggle"

export default {
  title: "Toggle",
}
export const Default: Story<ToggleProps> = (args) => (
  <div className="flex items-center space-x-2">
    <Toggle id="airplane-mode" {...args} />
    <Label htmlFor={args.id}>Airplane Mode</Label>
  </div>
)
