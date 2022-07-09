import { Alert } from "./Alert"
import { ComponentStory, ComponentMeta } from "@storybook/react"
import Button from "../Button"

export default {
  title: "atoms/Alert",
  component: Alert,
}

const Template: ComponentStory<typeof Alert> = (args) => (
  <div style={{ maxWidth: "800px" }}>
    <Alert {...args} />
  </div>
)

export const Info = Template.bind({})
Info.args = { status: "info", text: "This is a very informative alert" }

export const Success = Template.bind({})
Success.args = { status: "success", text: "This is a success message" }

export const Warning = Template.bind({})
Warning.args = { status: "warning", text: "This is a warning alert - check this out!" }

export const Danger = Template.bind({})
Danger.args = { status: "danger", text: "The apocalypse is coming and zombies are on the loose" }
