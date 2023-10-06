import { Badge } from "./Badge";

export default {
  title: "atoms/Badge",
  component: Badge,
};

export const Light = () => (
  <div className="grid gap-2">
    <Badge color="green" variant="light">
      Green
    </Badge>
    <Badge color="red" variant="light">
      Red
    </Badge>
    <Badge color="blue" variant="light">
      Blue
    </Badge>
    <Badge color="amber" variant="light">
      Amber
    </Badge>
    <Badge color="slate" variant="light">
      Slate
    </Badge>
  </div>
);

export const Solid = () => (
  <div className="grid gap-2">
    <Badge color="green" variant="solid">
      Red
    </Badge>
    <Badge color="red" variant="solid">
      Red
    </Badge>
    <Badge color="blue" variant="solid">
      Blue
    </Badge>
    <Badge color="amber" variant="solid">
      Amber
    </Badge>
    <Badge color="slate" variant="solid">
      Slate
    </Badge>
  </div>
);
export const Outline = () => (
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
    <Badge color="slate" variant="outline">
      Slate
    </Badge>
  </div>
);
