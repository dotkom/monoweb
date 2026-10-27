"use client"

import { getNotificationTypeLabel } from "@dotkomonline/rpc/notification"
import { Badge } from "@dotkomonline/ui"
import { IconBell } from "@tabler/icons-react"
import { EditNotificationForm } from "../components/EditNotificationForm"
import { useNotificationDetailsContext } from "./provider"

export default function NotificationContentPage() {
  const { notification } = useNotificationDetailsContext()

  return (
    <div className="flex flex-col gap-4">
      <Badge variant="secondary">
        <IconBell />
        {getNotificationTypeLabel(notification.type)}
      </Badge>
      <EditNotificationForm notification={notification} />
    </div>
  )
}
