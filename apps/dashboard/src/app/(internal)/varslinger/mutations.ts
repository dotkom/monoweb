import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useCreateNotificationMutation() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.notification.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Sender…",
          message: "Varslingen sendes til mottakerne.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Sendt",
          message: `Sendt til ${data.recipientCount} personer`,
        })

        await queryClient.invalidateQueries({
          queryKey: trpc.notification.findMany.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.notification.getRecipientStats.queryKey(),
        })
      },
      onError: (error) => {
        notification.fail({
          title: "Kunne ikke sende",
          message: error.message,
        })
      },
    })
  )
}
