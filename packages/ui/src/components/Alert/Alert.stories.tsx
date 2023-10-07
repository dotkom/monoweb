import { PropsWithChildren } from "react"
import { Alert, AlertProps } from "./Alert"
import type { Story, StoryDefault } from "@ladle/react"

export default {
  title: "Alert",
} satisfies StoryDefault<PropsWithChildren<AlertProps>>

const Template: Story<PropsWithChildren<AlertProps>> = (args) => <Alert {...args} />

export const Info = Template.bind({})
Info.args = {
  status: "info",
  title: "This is an informative alert",
  children: "Hi! I'm some text. This might either be very good or very bad.",
}

export const Success = Template.bind({})
Success.args = {
  status: "success",
  title: "This is an successful alert",
  children: "Hi! I'm some text. This might either be very good or very bad.",
}

export const Warning = Template.bind({})
Warning.args = {
  status: "info",
  title: "This is an warning alert",
  children: "Hi! I'm some text. This might either be very good or very bad.",
}

export const Danger = Template.bind({})
Danger.args = {
  status: "danger",
  title: "This is an danger alert",
  children: "Hi! I'm some text. This might either be very good or very bad.",
}
