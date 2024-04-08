import type { Story } from "@ladle/react"
import { Icon } from "../Icon"

import { Button, type ButtonProps } from "./Button"

const Template: Story<ButtonProps> = (props) => <Button {...props}>{props.children}</Button>

Template.args = {
  variant: "brand",
  children: "Click me",
}

export const Gradient = Template.bind({})
Gradient.args = {
  ...Template.args,
  variant: "gradient",
}

export const Link = Template.bind({})
Link.args = {
  ...Template.args,
  variant: "link",
}

export const Outline = Template.bind({})
Outline.args = {
  ...Template.args,
  variant: "outline",
}

export const Sizes: Story = () => {
  return (
    <div>
      <Button size="sm">Click me!</Button>
      <Button size="md">Click me!</Button>
      <Button size="lg">Click me!</Button>
    </div>
  )
}

export const Solid: Story = () => (
  <div className="max-w-screen-lg space-y-4">
    <Button variant="solid" color="blue">
      Click me!
    </Button>
    <Button variant="solid" color="red">
      Click me!
    </Button>
    <Button variant="solid" color="amber">
      Click me!
    </Button>
    <Button variant="solid" color="green">
      Click me!
    </Button>
    <Button variant="solid" color="slate">
      Click me!
    </Button>
  </div>
)
export const Subtle: Story = () => (
  <div className="max-w-screen-lg space-y-4">
    <Button variant="subtle" color="blue">
      Click me!
    </Button>
    <Button variant="subtle" color="red">
      Click me!
    </Button>
    <Button variant="subtle" color="amber">
      Click me!
    </Button>
    <Button variant="subtle" color="green">
      Click me!
    </Button>
    <Button variant="subtle" color="slate">
      Click me!
    </Button>
  </div>
)
export const Light: Story = () => (
  <div className="max-w-screen-lg space-y-4">
    <Button variant="light" color="blue">
      Click me!
    </Button>
    <Button variant="light" color="red">
      Click me!
    </Button>
    <Button variant="light" color="amber">
      Click me!
    </Button>
    <Button variant="light" color="green">
      Click me!
    </Button>
    <Button variant="light" color="slate">
      Click me!
    </Button>
  </div>
)

export const Disabled: Story = Template.bind({})

Disabled.args = {
  children: "Button",
  disabled: true,
}

export const WithIcon = () => (
  <div>
    <Button color="blue" variant="light" icon={<Icon icon="tabler:adjustments" width={16} />}>
      Settings
    </Button>
    <Button color="blue" variant="solid" icon={<Icon icon="tabler:mail" width={16} />}>
      Mail
    </Button>
  </div>
)

export const Loading: Story = Template.bind({})
Loading.args = {
  children: "Submitting form",
  loading: true,
}
