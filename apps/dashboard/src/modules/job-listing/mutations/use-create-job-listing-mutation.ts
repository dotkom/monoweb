import { useRouter } from "next/navigation"
import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useCreateJobListingMutation = () => {
  const router = useRouter()
  const notification = useQueryNotification()
  return trpc.jobListing.create.useMutation({
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
}
