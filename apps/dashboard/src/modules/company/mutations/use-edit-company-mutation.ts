import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation } from "@tanstack/react-query"

export const useEditCompanyMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.company.edit.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer bedrift...",
          message: "Bedriften blir oppdatert.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Bedrift oppdatert",
          message: `Bedriften "${data.name}" har blitt oppdatert.`,
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av bedriften: ${err.toString()}.`,
        })
      },
    })
  )
}
