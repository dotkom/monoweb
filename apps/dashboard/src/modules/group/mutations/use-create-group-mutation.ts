import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateGroupMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.group.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter gruppe...",
          message: "Gruppen blir opprettet.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Gruppen er opprettet",
          message: `Gruppen "${data.name}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.group.all.queryOptions())
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelsen: ${err.toString()}.`,
        })
      },
    })
  )
}
