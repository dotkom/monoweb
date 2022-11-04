import { Button } from "./Button"

export default {
  title: "atoms/Button",
  component: Button,
}

export const Solid = () => (
  <div className="flex flex-wrap justify-around max-w-[500px]">
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
