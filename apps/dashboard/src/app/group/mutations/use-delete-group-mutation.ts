import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc"

import { useMutation } from "@tanstack/react-query"

export const useDeleteGroupMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.group.delete.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Sletter gruppen",
          message: "Gruppen slettes. Vennligst vent.",
        })
      },
      onSuccess: () => {
        notification.complete({
          title: "Gruppen er slettet",
          message: "Gruppen er fjernet fra systemet.",
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under slettingen: ${err.toString()}.`,
        })
      },
    })
  )
}
