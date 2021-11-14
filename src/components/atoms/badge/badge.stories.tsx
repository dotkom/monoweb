import { Badge } from "theme-ui";

export default {
    title: "atoms/Badge",
    component: Badge,
};

export const subtleBadge = () => <Badge variant="green.subtle">TEST</Badge>

export const solidBadge = () => <Badge variant="green.solid">TEST</Badge>

export const outlineBadge = () => <Badge variant="green.outline">TEST</Badge> 
