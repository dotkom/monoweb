import { IconAdjustments, IconMail, IconMailFast } from "@tabler/icons"
import { IoSettings } from "react-icons/io5"

import { Button } from "./Button"

export default {
  title: "atoms/Button",
  component: Button,
}

export const Solid = () => (
  <div className="flex max-w-[500px] flex-wrap justify-around">
    <Button color="blue" variant="solid">
      Button
    </Button>
    <Button color="red" variant="solid">
      Button
    </Button>
    <Button color="amber" variant="solid">
      Button
    </Button>
    <Button color="green" variant="solid">
      Button
    </Button>
    <Button color="slate" variant="solid">
      Button
    </Button>
  </div>
)

export const Light = () => (
  <div className="flex max-w-[500px] flex-wrap justify-around">
    <Button color="blue" variant="light">
      Button
    </Button>
    <Button color="red" variant="light">
      Button
    </Button>
    <Button color="amber" variant="light">
      Button
    </Button>
    <Button color="green" variant="light">
      Button
    </Button>
    <Button color="slate" variant="light">
      Button
    </Button>
  </div>
)

export const NonInteractive= () => (
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
