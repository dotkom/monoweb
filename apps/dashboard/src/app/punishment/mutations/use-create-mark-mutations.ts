import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateMarkMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.mark.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter...",
          message: "Vellykket opprettelse. Du blir sendt til ressursen.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Opprettet",
          message: "Ressursen har blitt opprettet.",
        })

        await queryClient.invalidateQueries(trpc.mark.all.queryOptions())
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
