import { Badge, BadgeProps } from "theme-ui";
import { darken, lighten } from '@theme-ui/color'

export default {
    title: "Badge",
    component: Badge,
};

export const subtleBadge = () => <Badge variant="subtle"
    sx={{
        bg: "background",
        color: darken("green", 0.02),
        border: "1px solid",
        borderColor: darken("green", 0.02),
    }}

>TEST</Badge>

export const solidBadge = () => <Badge variant="solid"
    sx={{
        bg: darken("green", 0.02)
    }}

>TEST</Badge>

export const outlineBadge = () => <Badge variant="outline"
    sx={{
        color: darken('green', 0.1),
        bg: lighten('green', 0.6),
    }}
    >TEST</Badge>