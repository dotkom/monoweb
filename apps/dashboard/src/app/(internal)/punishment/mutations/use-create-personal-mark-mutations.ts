import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreatePersonalMarkMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.personalMark.addToUser.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter...",
          message: "Vellykket opprettelse. Du blir sendt til ressursen.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Opprettet",
          message: "Prikken har blitt gitt.",
        })

        await queryClient.invalidateQueries(trpc.personalMark.getByMark.pathFilter())
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
