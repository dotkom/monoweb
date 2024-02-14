import { notifications } from "@mantine/notifications"
import { Icon } from "@iconify/react"
import { useState } from "react"

export interface NotificationProps {
  title: string
  message: string
  id?: string
  method?: "show" | "update"
}

interface NotificationConfig {
  color: string
  icon: JSX.Element
  loading?: boolean
}

// Factory function to create a notification method
// Defaults to showing a notification
const createNotificationMethod =
  (config: NotificationConfig) =>
  ({ title, message, id, method }: NotificationProps) =>
    notifications[method || "show"]({
      title,
      message,
      id,
      ...config,
    })

// Notification configurations
const notificationConfigs: Record<string, NotificationConfig> = {
  fail: {
    color: "red",
    icon: <Icon icon="tabler:mood-sad-dizzy" />,
  },
  success: {
    color: "green",
    icon: <Icon icon="tabler:check" />,
  },
  loading: {
    color: "blue",
    icon: <Icon icon="tabler:loader-2" />,
    loading: true,
  },
  complete: {
    color: "green",
    icon: <Icon icon="tabler:check" />,
    loading: false,
  },
}

export const useQueryNotification = () => {
  const [id] = useState(() => crypto.randomUUID())
  const loading = createNotificationMethod(notificationConfigs.loading)
  const complete = createNotificationMethod(notificationConfigs.complete)
  const fail = createNotificationMethod(notificationConfigs.fail)

  return {
    loading: (props: NotificationProps) => loading({ ...props, id, method: "show" }),
    complete: (props: NotificationProps) => complete({ ...props, id, method: "update" }),
    fail: (props: NotificationProps) => fail({ ...props, id, method: "update" }),
  }
}

export const notifyLoading = (props: NotificationProps) =>
  notifications[props.method || "show"]({ ...props, ...notificationConfigs.loading })

export const notifyComplete = (props: NotificationProps) =>
  notifications[props.method || "show"]({ ...props, ...notificationConfigs.complete })

export const notifyFail = (props: NotificationProps) =>
  notifications[props.method || "show"]({ ...props, ...notificationConfigs.fail })
