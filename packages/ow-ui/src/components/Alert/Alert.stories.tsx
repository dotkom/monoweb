import { Alert } from "./Alert"
import { StoryObj } from "@storybook/react"

export default {
  title: "Alert",
  component: Alert,
}

type Story = StoryObj<typeof Alert>

export const Info: Story = {
  render: (args) => (
    <div className="max-w-[400px]">
      <Alert
        {...args}
        children="Something happened! You made a mistake and there is no going back, your data was lost forever!"
      />
    </div>
  ),
  args: {
    status: "info",
    title: "This is a very informative alert",
  },
}

export const Success: Story = {
  ...Info,
  args: {
    status: "success",
    title: "This is a success message",
  },
}

export const Warning: Story = {
  ...Info,
  args: {
    status: "warning",
    title: "This is a warning message",
  },
}

export const Danger: Story = {
  ...Info,
  args: {
    status: "danger",
    title: "This is a danger message",
  },
}
