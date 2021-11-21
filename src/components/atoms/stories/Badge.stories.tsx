import { Badge } from "theme-ui";

export default {
  title: "atoms/Badge",
  component: Badge,
};

export const subtleBadge = () => <Badge variant="green.subtle">TEST</Badge>;
export const solidBadge = () => <Badge variant="gray.solid">TEST</Badge>;
export const outlineBadge = () => <Badge variant="red.outline">TEST</Badge>;
export const outline2Badge = () => <Badge variant="green.outline">TEST</Badge>;
export const outline3Badge = () => <Badge variant="orange.outline">TEST</Badge>;
export const outline4Badge = () => <Badge variant="gray.outline">TEST</Badge>;
