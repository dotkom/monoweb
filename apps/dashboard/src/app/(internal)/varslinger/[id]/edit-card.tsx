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
    onSubmit: (data) => {
      edit.mutate({ id: notification.id, input: data })
    },
    defaultValues: {
      ...notification,
      shortDescription: notification.shortDescription ?? "",
      payload: notification.payload ?? "",
      recipientIds: [],
    },
  })
  return <FormComponent />
}
