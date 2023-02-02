import { Meta, StoryObj } from "@storybook/react"
import { IconAdjustments, IconMail } from "@tabler/icons"

import { Button } from "./Button"

const meta: Meta<typeof Button> = {
  title: "Button",
  component: Button,
}
export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = { args: { children: "Button", variant: "brand" } }

export const Gradient: Story = {
  ...Default,
  args: { ...Default.args, variant: "gradient" },
}

export const Link: Story = {
  ...Default,
  args: { ...Default.args, variant: "link" },
}
export const Outline: Story = {
  ...Default,
  args: { ...Default.args, variant: "outline" },
}

const MultiStory = (args: Story["args"][]) => ({
  render: () => (
    <div className="flex max-w-[500px] flex-wrap justify-around">
      {args.map((props) => (
        <Button {...props} />
      ))}
    </div>
  ),
})

export const Sizes = MultiStory([
  { children: "Button", size: "sm" },
  { children: "Button", size: "md" },
  { children: "Button", size: "lg" },
])

export const Solid = MultiStory([
  { children: "Blue", color: "blue", variant: "solid" },
  { children: "Red", color: "red", variant: "solid" },
  { children: "Amber", color: "amber", variant: "solid" },
  { children: "Green", color: "green", variant: "solid" },
  { children: "Slate", color: "slate", variant: "solid" },
])

export const Light = MultiStory([
  { children: "Blue", color: "blue", variant: "light" },
  { children: "Red", color: "red", variant: "light" },
  { children: "Amber", color: "amber", variant: "light" },
  { children: "Green", color: "green", variant: "light" },
  { children: "Slate", color: "slate", variant: "light" },
])

export const Subtle = MultiStory([
  { children: "Blue", color: "blue", variant: "subtle" },
  { children: "Red", color: "red", variant: "subtle" },
  { children: "Amber", color: "amber", variant: "subtle" },
  { children: "Green", color: "green", variant: "subtle" },
  { children: "Slate", color: "slate", variant: "subtle" },
])

export const Disabled: Story = {
  args: {
    children: "Button",
    disabled: true,
  },
}

export const WithIcon = MultiStory([
  { children: "Settings", color: "blue", variant: "light", icon: <IconAdjustments size={16} /> },
  { children: "Mail", color: "blue", variant: "solid", icon: <IconMail size={16} /> },
])

export const Loading: Story = {
  args: {
    children: "Submitting form",
    loading: true,
  },
}
