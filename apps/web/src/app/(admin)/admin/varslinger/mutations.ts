import { useQueryGenericMutationNotification, useQueryNotification } from "@admin/lib/notifications"
import { useTRPC } from "@admin/lib/trpc-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export function useCreateNotificationDraftMutation() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  const router = useRouter()

  return useMutation(
    trpc.notification.createDraft.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter utkast…",
          message: "",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Utkast opprettet",
          message: "Velg mottakere og forhåndsvis innholdet før du sender.",
        })

        await queryClient.invalidateQueries({
          queryKey: trpc.notification.findMany.infiniteQueryKey(),
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.notification.getRecipientStats.queryKey(),
        })

        router.replace(`/admin/varslinger/${data.id}`)
      },
      onError: (error) => {
        notification.fail({
          title: "Kunne ikke opprette utkast",
          message: error.message,
          error: error,
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

export function useSaveNotificationDraftRecipientsMutation() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { fail, loading, complete } = useQueryGenericMutationNotification({ method: "update" })

  return useMutation(
    trpc.notification.saveDraftRecipients.mutationOptions({
      onMutate: loading,
      onError: fail,
      onSuccess: async () => {
        complete()
        await queryClient.invalidateQueries({ queryKey: trpc.notification.get.queryKey() })
      },
    })
  )
}

export function useSendNotificationDraftMutation() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.notification.sendDraft.mutationOptions({
      onMutate: () => notification.loading({ title: "Sender…", message: "" }),
      onError: (error) => notification.fail({ title: "Kunne ikke sende", message: error.message, error }),
      onSuccess: async (result) => {
        notification.complete({ title: "Sendt", message: `Sendt til ${result.recipientCount} mottakere` })
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: trpc.notification.get.queryKey() }),
          queryClient.invalidateQueries({ queryKey: trpc.notification.findMany.infiniteQueryKey() }),
          queryClient.invalidateQueries({ queryKey: trpc.notification.getRecipientStats.queryKey() }),
          queryClient.invalidateQueries({ queryKey: trpc.notification.findRecipients.infiniteQueryKey() }),
        ])
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

        router.replace("/admin/varslinger")
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
          error: error,
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
          error: error,
        })
      },
    })
  )
}
