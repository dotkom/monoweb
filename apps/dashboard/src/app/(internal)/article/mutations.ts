import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export const useCreateArticleMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
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
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(trpc.article.get.queryOptions(data.id))
        await queryClient.invalidateQueries(trpc.article.all.queryOptions())
        await queryClient.invalidateQueries(trpc.article.getTags.queryOptions())

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

export const useEditArticleMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.article.edit.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer artikkel...",
          message: "Artikkelen blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(trpc.article.get.queryOptions(data.id))
        await queryClient.invalidateQueries(trpc.article.all.queryOptions())
        await queryClient.invalidateQueries(trpc.article.getTags.queryOptions())

        notification.complete({
          title: "Artikkelen oppdatert",
          message: `Artikkelen "${data.title}" har blitt oppdatert.`,
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av artikkelen: ${err.toString()}.`,
        })
      },
    })
  )
}
