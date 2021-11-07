import { ComponentProps, FC } from "react";
import { Badge as TBadge } from "theme-ui";

interface BadgeProps extends ComponentProps<typeof TBadge> {
  color: string;
}

const Badge: FC<BadgeProps> = ({ children, color, ...props }) => <TBadge {...props}> {children} </TBadge>;

export default Badge;
