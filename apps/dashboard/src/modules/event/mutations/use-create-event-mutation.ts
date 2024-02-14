import { useRouter } from "next/navigation"
import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useCreateEventMutation = () => {
  const router = useRouter()
  const notification = useQueryNotification()
  return trpc.event.create.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppretter arrangement...",
        message: "Arrangementet blir opprettet, og du vil bli videresendt til arrangementsiden.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Arrangement opprettet",
        message: `Arrangementet "${data.title}" har blitt opprettet.`,
      })

      router.push(`/event/${data.id}`)
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under opprettelse av arrangementet: ${err.toString()}.`,
      })
    },
  })
}
