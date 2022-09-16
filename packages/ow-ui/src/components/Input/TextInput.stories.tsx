import { useState } from "react"
import { ComponentStory } from "@storybook/react"
import { TextInput } from "./TextInput"

export default {
  title: "atoms/TextInput",
  component: TextInput,
}

const Template: ComponentStory<typeof TextInput> = (args) => {
  const [checked, setChecked] = useState(false)
  return (
    <div style={{ padding: "40px", maxWidth: "300px" }}>
      <TextInput id="name" label="Full name" {...args} />
    </div>
  )
}

export const Default = Template.bind({})

export const Placeholder = Template.bind({})
Placeholder.args = { placeholder: "Homer Simpson" }
