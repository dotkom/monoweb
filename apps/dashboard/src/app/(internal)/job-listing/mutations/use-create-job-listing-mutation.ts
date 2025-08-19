import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"
import { useRouter } from "next/navigation"

import { useMutation } from "@tanstack/react-query"

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

        router.push(`/job-listing/${data.id}`)
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
