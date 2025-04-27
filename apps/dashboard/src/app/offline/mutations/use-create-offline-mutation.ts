import { useQueryNotification } from "@/notifications"
import { useTRPC } from "@/trpc"
import { useRouter } from "next/navigation"

import { useMutation } from "@tanstack/react-query"

export const useCreateOfflineMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const notification = useQueryNotification()
  return useMutation(
    trpc.offline.create.mutationOptions({
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
  )
}
