import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useDeleteGroupMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.group.delete.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Sletter gruppen",
          message: "Gruppen slettes. Vennligst vent.",
        })
      },
      onSuccess: async () => {
        notification.complete({
          title: "Gruppen er slettet",
          message: "Gruppen er fjernet fra systemet.",
        })

        await queryClient.invalidateQueries(trpc.group.all.queryOptions())
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
