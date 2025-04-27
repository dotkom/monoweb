import { useQueryNotification } from "@/notifications"
import { useTRPC } from "@/trpc"

import { useMutation } from "@tanstack/react-query"

export const useEditJobListingMutation = () => {
  const trpc = useTRPC()
  const notification = useQueryNotification()

  return useMutation(
    trpc.jobListing.edit.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer stillingsannonse...",
          message: "Stillingsannonsen blir oppdatert.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Stillingsannonse oppdatert",
          message: `Stillingsannonsen "${data.title}" har blitt oppdatert.`,
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av stillingsannonsen: ${err.toString()}.`,
        })
      },
    })
  )
}
