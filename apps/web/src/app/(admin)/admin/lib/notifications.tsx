import type { AppRouter } from "@dotkomonline/rpc"
import { Button, Text, toast, type ToastType } from "@dotkomonline/ui"
import type { TRPCClientErrorLike } from "@trpc/client"
import { useState } from "react"
import { useTRPC } from "./trpc-client";
import { BugReportButton } from "src/components/molecules/BugReport/BugReportButton";

export interface NotificationProps {
  title: string
  message: string
  id?: string
  method?: "add" | "update"
  autoClose?: number | false
  error?: TRPCClientErrorLike<AppRouter>
}

type NotifyProps =
  | { method?: "add"; id?: string; title: string; message: string; autoClose?: number | false; error?: TRPCClientErrorLike<AppRouter> }
  | { method: "update"; id: string; title: string; message: string; autoClose?: number | false; error?: TRPCClientErrorLike<AppRouter> }

// Factory function to create a notification method
// Defaults to adding a notification
const createNotificationMethod =
  (type: ToastType) =>
  ({ title, message, id, method, autoClose, error }: NotifyProps) => {
    if (type === "error") {
      return toast.update(id ?? "", {
        type,
        title,
        description: message,
        timeout: getTimeout(autoClose),
        data: {
          actionLayout: "col",
          customAction: true,
        },
        actionProps: {
          children: error ? <BugReportButton message={message} error={error} /> : undefined,
        }
      })
    }
    
    if (method === "update") {
      return toast.update(id, {
        type,
        title,
        description: message,
        timeout: getTimeout(autoClose),
      })
    }

    return toast.add({
      type,
      title,
      description: message,
      timeout: getTimeout(autoClose),
      id,
    })
  }

const notificationConfigs: Record<string, ToastType> = {
  fail: "error",
  success: "success",
  loading: "loading",
  complete: "success",
}

export const useQueryNotification = () => {
  const [id] = useState(() => crypto.randomUUID())
  const loading = createNotificationMethod(notificationConfigs.loading)
  const complete = createNotificationMethod(notificationConfigs.complete)
  const fail = createNotificationMethod(notificationConfigs.fail)

  return {
    loading: (props: NotificationProps) => loading({ ...props, id, method: "add" }),
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
        method: "add",
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
        autoClose: false,
        error: error,
      }),
  }
}

export const notifyLoading = (props: NotifyProps) => {
  if (props.method === "update") {
    return toast.update(props.id, {
      title: props.title,
      description: props.message,
      type: notificationConfigs.loading,
      timeout: getTimeout(props.autoClose),
    })
  }

  return toast.add({
    title: props.title,
    description: props.message,
    type: notificationConfigs.loading,
    timeout: getTimeout(props.autoClose),
    id: props.id,
  })
}

export const notifyComplete = (props: NotifyProps) => {
  if (props.method === "update") {
    return toast.update(props.id, {
      title: props.title,
      description: props.message,
      type: notificationConfigs.complete,
      timeout: getTimeout(props.autoClose),
    })
  }

  return toast.add({
    title: props.title,
    description: props.message,
    type: notificationConfigs.complete,
    timeout: getTimeout(props.autoClose),
    id: props.id,
  })
}

export const notifyFail = (props: NotifyProps) => {
  if (props.method === "update") {
    return toast.update(props.id, {
      title: props.title,
      description: props.message,
      type: notificationConfigs.fail,
      timeout: getTimeout(props.autoClose),
    })
  }

  return toast.add({
    title: props.title,
    description: props.message,
    type: notificationConfigs.fail,
    timeout: getTimeout(props.autoClose),
    id: props.id,
  })
}

function getTimeout(autoClose: number | false | undefined) {
  // Timeout of 0 means the notification will never close automatically
  return autoClose === false ? 0 : autoClose
}
