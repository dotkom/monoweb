import { useRouter } from "next/navigation"
import { useQueryNotification } from "../../../app/notifications"
import { useTRPC } from "../../../trpc"

import { useMutation } from "@tanstack/react-query"

export const useCreateMarkMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const notification = useQueryNotification()
  return useMutation(
    trpc.mark.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter prikk...",
          message: "Prikk blir opprettet, og du vil bli videresendt til prikken.",
        })
      },
      onSuccess: (data) => {
        notification.complete({
          title: "Prikk opprettet",
          message: `Prikk "${data.title}" har blitt opprettet.`,
        })

        router.push(`/mark/${data.id}`)
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelse av prikken: ${err.toString()}.`,
        })
      },
    })
  )
}
