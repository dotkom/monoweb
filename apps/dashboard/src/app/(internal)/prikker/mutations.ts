import { useQueryGenericMutationNotification, useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"
import type { MarkId } from "@dotkomonline/rpc/mark"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export const useCreateMarkMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { fail, loading, complete } = useQueryGenericMutationNotification({
    method: "create",
  })

  return useMutation(
    trpc.mark.create.mutationOptions({
      onMutate: () => {
        loading()
      },
      onSuccess: async (data) => {
        complete()

        await queryClient.invalidateQueries({ queryKey: trpc.mark.findMany.queryKey() })
        router.push(`/prikker/${data.id}`)
      },
      onError: (err) => {
        fail(err)
      },
    })
  )
}

export const useEditMarkMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.mark.edit.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer prikk...",
          message: "Prikken blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Prikk oppdatert",
          message: `Prikk "${data.id}" har blitt oppdatert.`,
        })

        await queryClient.invalidateQueries(trpc.mark.get.queryOptions(data.id))
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av prikk: ${err.toString()}.`,
        })
      },
    })
  )
}

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
      onSuccess: async (_data) => {
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

export const useAddPersonalMarkToUserMutation = (markId: MarkId) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  const markQueryOptions = trpc.personalMark.getPersonalMarkDetailsByMark.queryOptions({
    markId,
  })

  return useMutation(
    trpc.personalMark.addToUser.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Legger til prikk...",
          message: "Prikken blir gitt til brukeren.",
        })
      },
      onSuccess: () => {
        notification.complete({
          title: "Prikk gitt",
          message: `Prikk har blitt gitt til brukeren.`,
        })

        queryClient.invalidateQueries(markQueryOptions)
      },
    })
  )
}

export const useRemovePersonalMarkFromUserMutation = (markId: MarkId) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  const markQueryOptions = trpc.personalMark.getPersonalMarkDetailsByMark.queryOptions({
    markId,
  })

  return useMutation(
    trpc.personalMark.removeFromUser.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Fjerner prikk...",
          message: "Prikken blir fjernet fra brukeren.",
        })
      },
      onSuccess: () => {
        notification.complete({
          title: "Prikk fjernet",
          message: `Prikk har blitt fjernet fra brukeren.`,
        })

        queryClient.invalidateQueries(markQueryOptions)
      },
    })
  )
}
