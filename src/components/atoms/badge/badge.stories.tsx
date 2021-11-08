import { Badge, BadgeProps } from "theme-ui";

export default {
    title: "Badge",
    component: Badge,
};

export const subtleBadge = () => <Badge variant="green.subtle">TEST</Badge>

export const outlineBadge = () => <Badge variant="green.outline">TEST</Badge> 
