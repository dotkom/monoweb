import { useRouter } from "next/navigation"
import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useCreateCompanyMutation = () => {
  const router = useRouter()
  const notification = useQueryNotification()
  return trpc.company.create.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppretter bedrift...",
        message: "Bedriften blir opprettet, og du vil bli videresendt til bedriftsiden.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Bedrift opprettet",
        message: `Bedriften "${data.name}" har blitt opprettet.`,
      })

      router.push(`/company/${data.id}`)
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under opprettelse av bedriften: ${err.toString()}.`,
      })

      // TODO: send error to sentry/other service so we can catch it
    },
  })
}
