import { notifications } from "@mantine/notifications"
import { Icon } from "@iconify/react"
import { useState } from "react"

export interface NotificationProps {
  title: string
  message: string
}

export const useQueryNotification = () => {
  const [id] = useState(() => crypto.randomUUID())
  const loading = ({ title, message }: NotificationProps) =>
    notifications.show({
      id,
      title,
      message,
      color: "blue",
      icon: <Icon icon="tabler:loader-2" />,
      loading: true,
    })
  const complete = ({ title, message }: NotificationProps) =>
    notifications.update({
      id,
      title,
      message,
      color: "green",
      icon: <Icon icon="tabler:check" />,
      loading: false,
    })
  const fail = ({ title, message }: NotificationProps) =>
    notifications.update({
      id,
      title,
      message,
      color: "red",
      icon: <Icon icon="tabler:mood-sad-dizzy" />,
    })

  return {
    loading,
    complete,
    fail,
  }
}
