import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"
import { useRouter } from "next/navigation"

export const useCreateJobListingMutation = () => {
  const utils = trpc.useContext()
  const router = useRouter()
  const notification = useQueryNotification()
  return trpc.jobListing.create.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppretter stillingsannonse...",
        message: "Bedriften blir opprettet, og du vil bli videresendt til stillingsannonsen.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Stillingsannonse opprettet",
        message: `Stillingsannonse "${data.title}" har blitt opprettet.`,
      })
      utils.jobListing.all.invalidate()
      router.push(`/joblisting/${data.id}`)
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under opprettelse av stillingsannonsen: ${err.toString()}.`,
      })

      // TODO: send error to sentry/other service so we can catch it
    },
  })
}
