import { useAuthorization } from "@/auth/authorization-context"
import type { FC } from "react"
import { useEditNotificationMutation } from "../mutations"
import { useNotificationWriteForm } from "../write-form"
import { useNotificationDetailsContext } from "./provider"

export const NotificationEditCard: FC = () => {
  const { notification } = useNotificationDetailsContext()
  const edit = useEditNotificationMutation()
  const { canManageNotifications } = useAuthorization()
  const canManage = canManageNotifications()

  const FormComponent = useNotificationWriteForm({
    label: "Oppdater varsling",
    disabled: !canManage,
    onSubmit: ({ recipientIds: _recipientIds, ...data }) => {
      edit.mutate({ id: notification.id, input: data })
    },
    defaultValues: {
      title: notification.title,
      shortDescription: notification.shortDescription ?? "",
      content: notification.content,
      type: notification.type,
      payload: notification.payload ?? "",
      payloadType: notification.payloadType,
      actorGroupId: notification.actorGroupId,
      taskId: notification.taskId,
      recipientIds: [],
    },
  })
  return <FormComponent />
}
