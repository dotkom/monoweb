import { env } from "@/lib/env"
import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useCreateNotificationMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.notification.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Lager varsling...",
          message: "Varslingen blir opprettet, og du vil bli videresendt til varslingssiden.",
        })
      },
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({ queryKey: trpc.notification.findMany.queryKey() });


        notification.complete({
          title: "Varsling opprettet",
          message: `Varslingen "${data.title}" har blitt opprettet.`,
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelse av varslingen: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useEditNotificationMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.notification.edit.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer varsling...",
          message: "Varslingen blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(trpc.notification.get.queryOptions(data.id))

        notification.complete({
          title: "Varslingen oppdatert",
          message: `Varslingen "${data.title}" har blitt oppdatert.`,
        })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av varslingen: ${err.toString()}.`,
        })
      },
    })
  )
}

