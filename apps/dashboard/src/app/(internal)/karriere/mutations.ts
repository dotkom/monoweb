import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export const useCreateJobListingMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const notification = useQueryNotification()
  return useMutation(
    trpc.jobListing.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter stillingsannonse...",
          message: "Stillingsannonsen blir opprettet, og du vil bli videresendt til stillingsannonsen.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Stillingsannonse opprettet",
          message: `Stillingsannonse "${data.title}" har blitt opprettet.`,
        })

        router.push(`/karriere/${data.id}`)
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelse av stillingsannonsen: ${err.toString()}.`,
        })
      },
    })
  )
}

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
        await queryClient.invalidateQueries(trpc.jobListing.findMany.queryOptions({}))
        await queryClient.invalidateQueries(trpc.jobListing.getLocations.queryOptions())
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
