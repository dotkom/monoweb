import type { AppRouter } from "@dotkomonline/gateway-trpc"
import { Icon } from "@iconify/react"
import { notifications } from "@mantine/notifications"
import type { TRPCClientErrorLike } from "@trpc/client"
import type { ReactNode } from "react"
import { useState } from "react"

export interface NotificationProps {
  title: string
  message: string
  id?: string
  method?: "show" | "update"
  autoClose?: number | false
}

interface NotificationConfig {
  color: string
  icon: ReactNode
  loading?: boolean
  autoClose?: number | false
}

// Factory function to create a notification method
// Defaults to showing a notification
const createNotificationMethod =
  (config: NotificationConfig) =>
  ({ title, message, id, method: _method, autoClose }: NotificationProps) => {
    const method = _method || "show"

    return notifications[method]({
      ...config,
      title,
      message,
      id,
      autoClose,
    })
  }

// Notification configurations
const notificationConfigs: Record<string, NotificationConfig> = {
  fail: {
    color: "red",
    icon: <Icon icon="tabler:mood-sad-dizzy" />,
    autoClose: false, // Never auto close failed notifications
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

const messages = {
  create: {
    success: "Opprettet",
    fail: "Opprettelse feilet",
    loading: "Oppretter",
  },
  update: {
    success: "Oppdatert",
    fail: "Oppdatering feilet",
    loading: "Oppdaterer",
  },
  delete: {
    success: "Slettet",
    fail: "Sletting feilet",
    loading: "Sletter",
  },
  generic: {
    success: "Utført",
    fail: "Feil",
    loading: "Laster",
  },
} as const

interface Props {
  method: "create" | "update" | "delete"
}
export const useQueryGenericMutationNotification = ({ method }: Props) => {
  const [id] = useState(() => crypto.randomUUID())
  const loading = createNotificationMethod(notificationConfigs.loading)
  const complete = createNotificationMethod(notificationConfigs.complete)
  const fail = createNotificationMethod(notificationConfigs.fail)

  const notificationText = messages[method]

  return {
    loading: () =>
      loading({
        title: notificationText.loading,
        message: "",
        id,
        method: "show",
      }),
    complete: () =>
      complete({
        title: notificationText.success,
        message: "",
        id,
        method: "update",
      }),
    fail: (error: TRPCClientErrorLike<AppRouter>) =>
      fail({
        title: notificationText.fail,
        message: `Feilmelding: ${error.message}`,
        id,
        method: "update",
      }),
  }
}

export const notifyLoading = (props: NotificationProps) =>
  notifications[props.method || "show"]({
    ...props,
    ...notificationConfigs.loading,
  })

export const notifyComplete = (props: NotificationProps) =>
  notifications[props.method || "show"]({
    ...props,
    ...notificationConfigs.complete,
  })

export const notifyFail = (props: NotificationProps) =>
  notifications[props.method || "show"]({
    ...props,
    ...notificationConfigs.fail,
  })
