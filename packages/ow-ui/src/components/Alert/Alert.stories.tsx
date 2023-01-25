import { Alert } from "./Alert"
import { ComponentStory } from "@storybook/react"

export default {
  title: "atoms/Alert",
  component: Alert,
}

const Template: ComponentStory<typeof Alert> = (args) => (
  <div className="max-w-[400px]">
    <Alert
      {...args}
      children="Something happened! You made a mistake and there is no going back, your data was lost forever!"
    />
  </div>
)

export const Info = Template.bind({})
Info.args = { status: "info", title: "This is a very informative alert" }

export const Success = Template.bind({})
Success.args = { status: "success", title: "This is a success message" }

export const Warning = Template.bind({})
Warning.args = { status: "warning", title: "This is a warning alert - check this out!" }

export const Danger = Template.bind({})
Danger.args = { status: "danger", title: "The apocalypse is coming and zombies are on the loose" }
