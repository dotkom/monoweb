import { Badge, BadgeProps } from "theme-ui";
import { darken, lighten } from '@theme-ui/color'

export default {
    title: "Badge",
    component: Badge,
};

export const subtleBadge = (props: BadgeProps) => <Badge variant="test"
    sx={{
    }}

>TEST</Badge>

export const solidBadge = () => <Badge variant="green.solid"
    sx={{
    }}

>TEST</Badge>

export const outlineBadge = () => <Badge variant="green.outline"
    sx={{
    }}
    >TEST</Badge> 