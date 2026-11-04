"use client"

import { EditNotificationForm } from "../components/EditNotificationForm"
import { NotificationPreview } from "../components/NotificationPreview"
import { useNotificationDetailsContext } from "./provider"

export default function NotificationContentPage() {
  const { notification, contentDraft, setContentDraft } = useNotificationDetailsContext()
  const previewNotification = { ...notification, ...contentDraft }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <EditNotificationForm
        notification={notification}
        contentDraft={contentDraft}
        onContentChange={setContentDraft}
        className="min-w-0"
      />
      <div className="max-lg:hidden min-w-0 lg:sticky lg:top-[calc(var(--resource-detail-header-bottom,0px)+1.5rem)]">
        <NotificationPreview notification={previewNotification} />
      </div>
    </div>
  )
}
