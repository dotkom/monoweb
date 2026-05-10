import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

export const useCreateContestMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.contest.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppretter konkurranse...",
          message: "Konkurransen blir opprettet.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Konkurranse opprettet",
          message: `Konkurransen "${data.name}" har blitt opprettet.`,
        })
        await queryClient.invalidateQueries({ queryKey: trpc.contest.findMany.queryKey() })
        router.replace(`/konkurranser/${data.id}`)
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelse av konkurransen: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useUpdateContestMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.contest.update.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer konkurranse...",
          message: "Konkurransen blir oppdatert.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Konkurranse oppdatert",
          message: `Konkurransen "${data.name}" har blitt oppdatert.`,
        })
        await queryClient.invalidateQueries(trpc.contest.getWithContestants.queryOptions(data.id))
        await queryClient.invalidateQueries({ queryKey: trpc.contest.findMany.queryKey() })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av konkurransen: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useDeleteContestMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.contest.delete.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Sletter konkurranse...",
          message: "Konkurransen blir slettet.",
        })
      },
      onSuccess: async () => {
        notification.complete({
          title: "Konkurranse slettet",
          message: "Konkurransen har blitt slettet.",
        })
        await queryClient.invalidateQueries({ queryKey: trpc.contest.findMany.queryKey() })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under sletting av konkurransen: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useAddContestantMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.contest.contestant.add.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Legger til deltaker...",
          message: "Deltakeren blir lagt til.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Deltaker lagt til",
          message: "Deltakeren har blitt lagt til i konkurransen.",
        })
        await queryClient.invalidateQueries(trpc.contest.getWithContestants.queryOptions(data.contestId))
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under tillegging av deltaker: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useRemoveContestantMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.contest.contestant.remove.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Fjerner deltaker...",
          message: "Deltakeren blir fjernet.",
        })
      },
      onSuccess: async (_data, variables) => {
        notification.complete({
          title: "Deltaker fjernet",
          message: "Deltakeren har blitt fjernet fra konkurransen.",
        })
        // We need to invalidate broadly since we don't have contestId in the response
        await queryClient.invalidateQueries({ queryKey: trpc.contest.getWithContestants.queryKey() })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under fjerning av deltaker: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useUpdateContestantResultMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.contest.contestant.updateResult.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Oppdaterer resultat...",
          message: "Resultatet blir oppdatert.",
        })
      },
      onSuccess: async () => {
        notification.complete({
          title: "Resultat oppdatert",
          message: "Resultatet har blitt oppdatert.",
        })
        await queryClient.invalidateQueries({ queryKey: trpc.contest.getWithContestants.queryKey() })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under oppdatering av resultatet: ${err.toString()}.`,
        })
      },
    })
  )
}

export const useSetWinnerMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  return useMutation(
    trpc.contest.setWinner.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Setter vinner...",
          message: "Vinneren blir satt.",
        })
      },
      onSuccess: async (data) => {
        notification.complete({
          title: "Vinner satt",
          message: "Vinneren har blitt satt for konkurransen.",
        })
        await queryClient.invalidateQueries(trpc.contest.getWithContestants.queryOptions(data.id))
        await queryClient.invalidateQueries({ queryKey: trpc.contest.findMany.queryKey() })
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under setting av vinner: ${err.toString()}.`,
        })
      },
    })
  )
}
