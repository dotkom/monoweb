import { useQueryNotification } from "src/app/notifications"
import { useTRPC } from "src/trpc"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useUpdateGroupMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.group.update.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer",
          message: "Gruppen blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Oppdatert",
          message: `Gruppen "${data.name}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.group.get.queryOptions(data.id))
        await queryClient.invalidateQueries(trpc.group.all.queryOptions())
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
