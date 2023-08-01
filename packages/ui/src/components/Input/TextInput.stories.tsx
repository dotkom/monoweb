import { ComponentStory } from "@storybook/react"

import { TextInput } from "./TextInput"

export default {
  title: "atoms/TextInput",
  component: TextInput,
}

const Template: ComponentStory<typeof TextInput> = (args) => {
  return (
    <div style={{ padding: "40px", maxWidth: "300px" }}>
      <TextInput id="name" label="Full name" {...args} />
    </div>
  )
}

export const Default = Template.bind({})

export const RequiredButton = Template.bind({})
RequiredButton.args = { required: true }

export const Placeholder = Template.bind({})
Placeholder.args = { placeholder: "Chad Thunder" }

export const Error = Template.bind({})
Error.args = { error: true, value: "Invalid text" }

export const ErrorWithMessage = Template.bind({})
ErrorWithMessage.args = { error: "Too short", value: "Shrimp gang" }

export const Disabled = Template.bind({})
Disabled.args = { disabled: true, value: "Do not touch my pringles" }
