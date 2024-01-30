import { useRouter } from "next/navigation"
import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useCreateOfflineMutation = () => {
  const utils = trpc.useContext()
  const router = useRouter()
  const notification = useQueryNotification()
  return trpc.offline.create.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Oppretter...",
        message: "Vellykkett opprettelse. Du blir sendt til ressursen.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Opprettet",
        message: "Ressursen har blitt opprettet.",
      })

      router.push(`/offline/${data.id}`)
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under opprettelsen: ${err.toString()}.`,
      })
    },
  })
}
