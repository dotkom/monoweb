import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateInterestGroupMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.interestGroup.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter interessegruppe...",
          message: "Interessegruppen blir opprettet.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Interessegruppen er opprettet",
          message: `Interessegruppen "${data.name}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.interestGroup.all.queryOptions())
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
