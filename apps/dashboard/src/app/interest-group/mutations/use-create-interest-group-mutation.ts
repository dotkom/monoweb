import { useQueryNotification } from "@/notifications"
import { useTRPC } from "@/trpc"

import { useMutation } from "@tanstack/react-query"

export const useCreateInterestGroupMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.interestGroup.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter interessegruppe...",
          message: "Interessegruppen blir opprettet.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Interessegruppen er opprettet",
          message: `Interessegruppen "${data.name}" har blitt oppdatert.`,
        })
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
