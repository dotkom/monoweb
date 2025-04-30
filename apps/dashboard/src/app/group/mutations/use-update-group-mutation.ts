import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc"

import { useMutation } from "@tanstack/react-query"

export const useUpdateGroupMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.group.update.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer",
          message: "Gruppen blir oppdatert.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Oppdatert",
          message: `Gruppen "${data.name}" har blitt oppdatert.`,
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
