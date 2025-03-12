import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation } from "@tanstack/react-query"

export const useEditOfflineMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.offline.edit.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer",
          message: "Ressursen blir oppdatert.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Ressursen oppdatert",
          message: `Ressursen "${data.title}" har blitt oppdatert.`,
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering: ${err.toString()}.`,
        })
      },
    })
  )
}
