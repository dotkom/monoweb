import { useQueryGenericMutationNotification, useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export function useCreateNotificationMutation() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  const router = useRouter()

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
          message: `Sendt til ${data.recipientCount === 1 ? "1 person" : `${data.recipientCount} personer`}`,
        })

        await queryClient.invalidateQueries({
          queryKey: trpc.notification.findMany.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.notification.getRecipientStats.queryKey(),
        })

        router.replace(`/varslinger/${data.notification.id}`)
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

export function useEditNotificationMutation() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "update",
  })

  return useMutation(
    trpc.notification.edit.mutationOptions({
      onMutate: loading,
      onError: fail,
      onSuccess: async () => {
        complete()

        await queryClient.invalidateQueries({
          queryKey: trpc.notification.get.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.notification.findMany.infiniteQueryKey(),
        })
      },
    })
  )
}

export function useDeleteNotificationMutation() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "delete",
  })

  return useMutation(
    trpc.notification.delete.mutationOptions({
      onMutate: loading,
      onError: fail,
      onSuccess: async () => {
        complete()

        await queryClient.invalidateQueries({
          queryKey: trpc.notification.findMany.infiniteQueryKey(),
        })

        router.replace("/varslinger")
      },
    })
  )
}

export function useAddNotificationRecipientsMutation() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.notification.addRecipients.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Legger til mottakere…",
          message: "",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Mottakere lagt til",
          message: `Lagt til ${data.addedCount === 1 ? "1 ny mottaker" : `${data.addedCount} nye mottakere`}`,
        })

        await queryClient.invalidateQueries({
          queryKey: trpc.notification.findRecipients.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.notification.getRecipientStats.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.notification.findMany.infiniteQueryKey(),
        })
      },
      onError: (error) => {
        notification.fail({
          title: "Kunne ikke legge til mottakere",
          message: error.message,
        })
      },
    })
  )
}

export function useRemoveNotificationRecipientsMutation() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.notification.removeRecipients.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Fjerner mottakere…",
          message: "",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Mottakere fjernet",
          message: `Fjernet ${data.removedCount === 1 ? "1 mottaker" : `${data.removedCount} mottakere`}`,
        })

        await queryClient.invalidateQueries({
          queryKey: trpc.notification.findRecipients.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.notification.getRecipientStats.queryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.notification.findMany.infiniteQueryKey(),
        })
      },
      onError: (error) => {
        notification.fail({
          title: "Kunne ikke fjerne mottakere",
          message: error.message,
        })
      },
    })
  )
}
