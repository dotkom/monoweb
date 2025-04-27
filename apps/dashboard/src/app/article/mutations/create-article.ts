import { useRouter } from "next/navigation"

import { useQueryNotification } from "@/notifications"
import { useTRPC } from "@/trpc"
import { useMutation } from "@tanstack/react-query"

export const useCreateArticleMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const notification = useQueryNotification()
  return useMutation(
    trpc.article.create.mutationOptions({
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
  )
}
