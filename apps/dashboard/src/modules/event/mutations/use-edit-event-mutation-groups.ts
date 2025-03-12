import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation } from "@tanstack/react-query"

export const useEditEventWithGroupsMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.event.editWithGroups.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer arrangement...",
          message: "Arrangementet blir oppdatert.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Arrangement oppdatert",
          message: `Arrangementet "${data.title}" har blitt oppdatert.`,
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av arrangementet: ${err.toString()}.`,
        })
      },
    })
  )
}
