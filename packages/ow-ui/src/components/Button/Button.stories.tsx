import Button from "./Button"
export default {
  title: "atoms/Button",
  component: Button,
}

export const Default = () => <Button>Default Button</Button>
export const Orange = () => <Button color="orange">Orange button</Button>
export const Green = () => <Button color="green">Green button</Button>
export const Red = () => <Button color="red">Red button</Button>
export const Gray = () => <Button color="gray">Gray Button</Button>
export const SubtleGray = () => <Button subtle={"gray"}>Gray text button</Button>
