import { StoryFn } from "@storybook/react"
import { DateTimePicker } from "./DateTimePicker"

export default {
  title: "DateTimePicker",
  component: DateTimePicker,
}

export const Default: StoryFn = () => <DateTimePicker label="Select date" />
