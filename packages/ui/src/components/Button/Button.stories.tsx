import type { Story } from "@ladle/react"
import { Icon } from "../Icon"

import { Button, type ButtonProps } from "./Button"

const Template: Story<ButtonProps> = (props) => <Button {...props}>{props.children}</Button>

Template.args = {
  variant: "solid",
  color: "brand",
  children: "Click me",
}

export const Sizes: Story = () => {
  return (
    <div className="flex gap-4">
      <Button size="sm">Click me!</Button>
      <Button size="md">Click me!</Button>
      <Button size="lg">Click me!</Button>
    </div>
  )
}

export const Solid: Story = () => (
  <div className="flex gap-4">
    <Button variant="solid" color="brand">
      Brand
    </Button>
    <Button variant="solid" color="gradient">
      Gradient
    </Button>
    <Button variant="solid" color="blue">
      Blue
    </Button>
    <Button variant="solid" color="red">
      Red
    </Button>
    <Button variant="solid" color="amber">
      Amber
    </Button>
    <Button variant="solid" color="green">
      Green
    </Button>
    <Button variant="solid" color="indigo">
      Indigo
    </Button>
  </div>
)

export const Outlined: Story = () => (
  <div className="flex gap-4">
    <Button variant="outline" color="brand">
      Brand
    </Button>
    <Button variant="outline" color="gradient">
      Gradient
    </Button>
    <Button variant="outline" color="blue">
      Blue
    </Button>
    <Button variant="outline" color="red">
      Red
    </Button>
    <Button variant="outline" color="amber">
      Amber
    </Button>
    <Button variant="outline" color="green">
      Green
    </Button>
    <Button variant="outline" color="indigo">
      Indigo
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
    <Button color="blue" variant="solid" icon={<Icon icon="tabler:mail" width={16} />}>
      Mail
    </Button>
  </div>
)
