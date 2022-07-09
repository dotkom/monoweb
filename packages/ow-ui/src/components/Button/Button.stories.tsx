import Button from "./Button"
export default {
  title: "atoms/Button",
  component: Button,
}

export const Default = () => (
  <Button color="blue" variant="solid">
    Default Button
  </Button>
)
export const subtleButton = () => (
  <Button color="blue" variant="subtle">
    Subtle Button
  </Button>
)

export const orangeButton = () => (
  <Button color="orange" variant="solid">
    Orange Button
  </Button>
)

export const infoButton = () => (
  <Button color="info" variant="solid">
    Info Button
  </Button>
)
