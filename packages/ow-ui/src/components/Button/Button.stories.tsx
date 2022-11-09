import { IconAdjustments, IconMail, IconMailFast } from "@tabler/icons"

import { Button } from "./Button"

export default {
  title: "atoms/Button",
  component: Button,
}

export const Solid = () => (
  <div className="flex max-w-[500px] flex-wrap justify-around">
    <Button color="blue" variant="solid">
      Blue
    </Button>
    <Button color="red" variant="solid">
      Red
    </Button>
    <Button color="amber" variant="solid">
      Amber
    </Button>
    <Button color="green" variant="solid">
      Green
    </Button>
    <Button color="slate" variant="solid">
      Slate
    </Button>
  </div>
)

export const Light = () => (
  <div className="flex max-w-[500px] flex-wrap justify-around">
    <Button color="blue" variant="light">
      Blue
    </Button>
    <Button color="red" variant="light">
      Red
    </Button>
    <Button color="amber" variant="light">
      Amber
    </Button>
    <Button color="green" variant="light">
      Green
    </Button>
    <Button color="slate" variant="light">
      Slate
    </Button>
  </div>
)
export const Subtle = () => {
  return (
    <div className="flex max-w-[500px] flex-wrap justify-around">
      <Button color="blue" variant="subtle">
        Blue
      </Button>
      <Button color="red" variant="subtle">
        Red
      </Button>
      <Button color="amber" variant="subtle">
        Amber
      </Button>
      <Button color="green" variant="subtle">
        Green
      </Button>
      <Button color="slate" variant="subtle">
        Slate
      </Button>
    </div>
  )
}

export const Gradient = () => <Button variant="gradient">Button</Button>

export const NonInteractive = () => (
  <Button color="blue" variant="light" nonInteractive={true}>
    Button
  </Button>
)

export const Icon = () => (
  <div className="flex max-w-[200px] flex-wrap justify-around">
    <Button color="blue" variant="light" icon={<IconAdjustments size={16} />}>
      Settings
    </Button>
    <Button color="blue" variant="solid" icon={<IconMail size={16} />}>
      Mail
    </Button>
  </div>
)
