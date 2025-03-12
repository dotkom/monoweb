import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation } from "@tanstack/react-query"

export const useEditMarkMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()
  return useMutation(
    trpc.mark.edit.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer prikk...",
          message: "Prikken blir oppdatert.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Prikk oppdatert",
          message: `Prikk "${data.id}" har blitt oppdatert.`,
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av prikk: ${err.toString()}.`,
        })
      },
    })
  )
}
