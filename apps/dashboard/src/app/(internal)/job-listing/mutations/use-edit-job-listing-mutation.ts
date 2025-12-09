import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"

export const useEditJobListingMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.jobListing.edit.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer stillingsannonse...",
          message: "Stillingsannonsen blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Stillingsannonse oppdatert",
          message: `Stillingsannonsen "${data.title}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.jobListing.get.queryOptions(data.id))
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
