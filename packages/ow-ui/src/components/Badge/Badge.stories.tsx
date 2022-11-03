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
