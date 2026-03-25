import type { FC } from "react"
import { useEditNotificationMutation } from "../mutations"
import { useNotificationWriteForm } from "../write-form"
import { useNotificationDetailsContext } from "./provider"

export const NotificationEditCard: FC = () => {
  const { notification } = useNotificationDetailsContext()
  const edit = useEditNotificationMutation()

  const FormComponent = useNotificationWriteForm({
    label: "Oppdater varsling",
    onSubmit: (data) => {
      const { ...notificationData } = data
      edit.mutate({ id: notification.id, input: notificationData })
    },
    defaultValues: { ...notification },
  })
  return <FormComponent />
}
