import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc"

import { useMutation } from "@tanstack/react-query"

export const useDeleteInterestGroupMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.interestGroup.delete.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Sletter interessegrupper",
          message: "Interessegruppen slettes. Vennligst vent.",
        })
      },
      onSuccess: () => {
        notification.complete({
          title: "Interessegruppen er slettet",
          message: "Interessegruppen er fjernet fra systemet.",
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
