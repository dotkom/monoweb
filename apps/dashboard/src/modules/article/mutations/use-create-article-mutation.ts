import { useRouter } from "next/navigation"
import { useQueryNotification } from "../../../app/notifications"
import { trpc } from "../../../utils/trpc"

export const useCreateArticleMutation = () => {
  const utils = trpc.useContext()
  const router = useRouter()
  const notification = useQueryNotification()
  return trpc.article.create.useMutation({
    onMutate: () => {
      notification.loading({
        title: "Lager artikkel...",
        message: "Artikkelen blir opprettet, og du vil bli videresendt til artikkelsiden.",
      })
    },
    onSuccess: (data) => {
      notification.complete({
        title: "Artikkel opprettet",
        message: `Artikkeln "${data.title}" har blitt opprettet.`,
      })

      router.push(`/article/${data.id}`)
    },
    onError: (err) => {
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under opprettelse av artikkelen: ${err.toString()}.`,
      })
    },
  })
}
