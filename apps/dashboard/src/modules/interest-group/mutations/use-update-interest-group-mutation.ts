import { useQueryNotification } from "src/app/notifications"
import { useTRPC } from "src/trpc"

import { useMutation } from "@tanstack/react-query"

export const useUpdateInterestGroupMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.interestGroup.update.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer",
          message: "Interessegruppen blir oppdatert.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Oppdatert",
          message: `Interessegruppen "${data.name}" har blitt oppdatert.`,
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
