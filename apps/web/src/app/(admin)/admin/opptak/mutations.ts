import { notifyFail, type NotificationProps, useQueryNotification } from "@admin/lib/notifications"
import { useTRPC } from "@admin/lib/trpc-client"
import type { AppRouter } from "@dotkomonline/rpc"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { TRPCClientErrorLike } from "@trpc/client"
import { useRouter } from "next/navigation"

export const notifyInterviewBlockTooShort = () =>
  notifyFail({
    title: "For kort tidsperiode",
    message: "Du kan ikke velge en tidsperiode mindre enn et intervju",
  })

export const notifyTooManyOverlappingInterviewBlocks = (maximumOverlapping: number) =>
  notifyFail({
    title: "For mange overlappende tider",
    message: `Du kan ikke ha mer enn ${maximumOverlapping} intervjutider som overlapper hverandre.`,
  })

const useMutationNotifications = (failedAction: string, loading?: NotificationProps) => {
  const notification = useQueryNotification()

  return {
    complete: notification.complete,
    onMutate: loading === undefined ? undefined : () => notification.loading(loading),
    onError: (err: TRPCClientErrorLike<AppRouter>) =>
      notification.fail({
        title: "Feil oppsto",
        message: `En feil oppsto under ${failedAction}: ${err.toString()}.`,
        error: err,
      }),
  }
}

export const useCreateApplicationPeriodMutation = () => {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { complete, ...notify } = useMutationNotifications("opprettelse av opptaket", {
    title: "Oppretter opptak...",
    message: "Opptaket blir opprettet.",
  })

  return useMutation(
    trpc.committeeApplication.createPeriod.mutationOptions({
      ...notify,
      onSuccess: async (data) => {
        complete({ title: "Opptak opprettet", message: `Opptaket "${data.name}" har blitt opprettet.` })
        await queryClient.invalidateQueries({ queryKey: trpc.committeeApplication.findManyPeriods.queryKey() })
        router.replace(`/admin/opptak/${data.id}`)
      },
    })
  )
}

export const useSyncInterviewBlocksMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.committeeApplication.setInterviewBlocks.mutationOptions({
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(
          trpc.committeeApplication.findManyInterviewBlocks.queryOptions({
            applicationGroupId: variables.applicationGroupId,
          })
        )
        await queryClient.invalidateQueries({ queryKey: trpc.committeeApplication.findManyGroups.queryKey() })
      },
      onError: (err) => {
        notifyFail({
          title: "Feil oppsto",
          message: `En feil oppsto under lagring av intervjutidene: ${err.message}.`,
          autoClose: false,
        })
      },
    })
  )
}

export const useRunInterviewMatchingMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { complete, ...notify } = useMutationNotifications("kjøring av matchealgoritmen", {
    title: "Kjører matchealgoritmen...",
    message: "Søkerne blir fordelt på ledige intervjutider.",
  })

  return useMutation(
    trpc.committeeApplication.generateInterviews.mutationOptions({
      ...notify,
      onSuccess: async (data, variables) => {
        complete({
          title: "Matching fullført",
          message: `${data.matchedInterviews} av ${data.totalWantedInterviews} intervjuer ble satt opp.`,
        })
        await queryClient.invalidateQueries(
          trpc.committeeApplication.findManyGroupMatchings.queryOptions({
            applicationPeriodId: variables.applicationPeriodId,
          })
        )
      },
    })
  )
}

export const useConfirmInterviewsMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { complete, ...notify } = useMutationNotifications("opprettelse av intervjuene", {
    title: "Oppretter intervjuer...",
    message: "Intervjuene blir låst inn.",
  })

  return useMutation(
    trpc.committeeApplication.confirmInterviews.mutationOptions({
      ...notify,
      onSuccess: async (data) => {
        complete({
          title: "Intervjuer opprettet",
          message: "Intervjuene er låst inn og matchealgoritmen kan ikke kjøres på nytt.",
        })
        await queryClient.invalidateQueries(
          trpc.committeeApplication.getPeriodById.queryOptions({ applicationPeriodId: data.id })
        )
      },
    })
  )
}

export const useDeleteApplicationPeriodMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { complete, ...notify } = useMutationNotifications("sletting av opptaket", {
    title: "Sletter opptak...",
    message: "Opptaket blir slettet.",
  })

  return useMutation(
    trpc.committeeApplication.deletePeriod.mutationOptions({
      ...notify,
      onSuccess: async () => {
        complete({ title: "Opptak slettet", message: "Opptaket har blitt slettet." })
        await queryClient.invalidateQueries({ queryKey: trpc.committeeApplication.findManyPeriods.queryKey() })
      },
    })
  )
}

export const useUpdateApplicationPeriodMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { complete, ...notify } = useMutationNotifications("oppdatering av opptaket", {
    title: "Oppdaterer opptak...",
    message: "Opptaket blir oppdatert.",
  })

  return useMutation(
    trpc.committeeApplication.updatePeriod.mutationOptions({
      ...notify,
      onSuccess: async (data) => {
        complete({ title: "Opptak oppdatert", message: `Opptaket "${data.name}" har blitt oppdatert.` })
        await queryClient.invalidateQueries(
          trpc.committeeApplication.getPeriodById.queryOptions({ applicationPeriodId: data.id })
        )
        await queryClient.invalidateQueries(
          trpc.committeeApplication.findManyGroups.queryOptions({ applicationPeriodId: data.id })
        )
        await queryClient.invalidateQueries({ queryKey: trpc.committeeApplication.findManyPeriods.queryKey() })
      },
    })
  )
}

export const useSetInterviewAttendanceMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { onError } = useMutationNotifications("lagring av deltakelsen")

  return useMutation(
    trpc.committeeApplication.setInterviewAttendance.mutationOptions({
      onError,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.committeeApplication.findManyGroupMatchings.queryKey() })
      },
    })
  )
}
