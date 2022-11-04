import { Badge } from "./Badge"

export default {
  title: "atoms/Badge",
  component: Badge,
}

export const Subtle = () => (
  <div className="grid gap-2">
    <Badge color="green" variant="subtle">
      Green
    </Badge>
    <Badge color="red" variant="subtle">
      Red
    </Badge>
    <Badge color="blue" variant="subtle">
      Blue
    </Badge>
    <Badge color="amber" variant="subtle">
      Amber
    </Badge>
  </div>
)

export const Filled = () => (
  <div className="grid gap-2">
    <Badge color="green" variant="filled">
      Red
    </Badge>
    <Badge color="red" variant="filled">
      Red
    </Badge>
    <Badge color="blue" variant="filled">
      Blue
    </Badge>
    <Badge color="amber" variant="filled">
      Amber
    </Badge>
  </div>
)
export const Outline= () => (
  <div className="grid gap-2">
    <Badge color="green" variant="outline">
      Green
    </Badge>
    <Badge color="red" variant="outline">
      Red
    </Badge>
    <Badge color="blue" variant="outline">
      Blue
    </Badge>
    <Badge color="amber" variant="outline">
      Amber
    </Badge>
  </div>
)