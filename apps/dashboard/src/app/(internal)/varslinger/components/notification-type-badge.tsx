import { getNotificationTypeLabel, type NotificationType } from "@dotkomonline/rpc/notification"
import { Badge } from "@mantine/core"

export function NotificationTypeBadge({ type }: { type: NotificationType }) {
  return (
    <Badge variant="light" size="sm">
      {getNotificationTypeLabel(type)}
    </Badge>
  )
}
