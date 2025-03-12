import { useRouter } from "next/navigation"
import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation } from "@tanstack/react-query"

export const useCreateEventMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const notification = useQueryNotification()
  return useMutation(
    trpc.event.create.mutationOptions({
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
  )
}
