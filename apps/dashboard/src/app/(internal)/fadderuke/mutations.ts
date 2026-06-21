import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export const useCreateFadderukeMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.fadderuke.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter fadderuke...",
          message: "Fadderuken blir opprettet.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Fadderuke opprettet",
          message: `Fadderuken for ${data.year} har blitt opprettet.`,
        })

        await queryClient.invalidateQueries({ queryKey: trpc.fadderuke.findMany.queryKey() })

        router.replace("/fadderuke")
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelse av fadderuken: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useUpdateFadderukeMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.fadderuke.update.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer fadderuke...",
          message: "Fadderuken blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Fadderuke oppdatert",
          message: `Fadderuken for ${data.year} har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries({ queryKey: trpc.fadderuke.findMany.queryKey() })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av fadderuken: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useDeleteFadderukeMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.fadderuke.delete.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Sletter fadderuke...",
          message: "Fadderuken blir slettet.",
        })
      },
      onSuccess: async () => {
        notification.complete({
          title: "Fadderuke slettet",
          message: "Fadderuken har blitt slettet.",
        })

        await queryClient.invalidateQueries({ queryKey: trpc.fadderuke.findMany.queryKey() })

        router.replace("/fadderuke")
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under sletting av fadderuken: ${err.toString()}.`,
        })
      },
    })
  )
}
