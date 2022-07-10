import { useState } from "react"
import { ComponentStory } from "@storybook/react"
import Checkbox from "./Checkbox"

export default {
  title: "atoms/Checkbox",
  component: Checkbox,
}

const Template: ComponentStory<typeof Checkbox> = (args) => {
  const [checked, setChecked] = useState(false)
  return (
    <div style={{ padding: "40px" }}>
      <Checkbox {...args} checked={checked} onCheckedChange={(checked) => setChecked(!!checked)} />
    </div>
  )
}

export const Default = Template.bind({})
Default.args = { label: "I accept terms and conditions.", id: "default" }

export const Disabled = Template.bind({})
Disabled.args = { label: "I accept terms and conditions.", disabled: true, id: "disabled" }
