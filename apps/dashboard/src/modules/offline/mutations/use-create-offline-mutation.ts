import { useRouter } from "next/navigation"
import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateOfflineMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.offline.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter...",
          message: "Vellykkett opprettelse. Du blir sendt til ressursen.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Opprettet",
          message: "Ressursen har blitt opprettet.",
        })

        await queryClient.invalidateQueries(trpc.offline.all.queryOptions())

        router.push(`/offline/${data.id}`)
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelsen: ${err.toString()}.`,
        })
      },
    })
  )
}
