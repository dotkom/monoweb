import { Badge } from "theme-ui";

export default {
    title: "atoms/Badge",
    component: Badge,
};

export const subtleBadge = () => <Badge variant="orange.subtle">TEST</Badge>
export const solidBadge = () => <Badge variant="orange.solid">TEST</Badge>
export const outlineBadge = () => <Badge variant="orange.outline">TEST</Badge>