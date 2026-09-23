"use client"

import { useQueryNotification } from "@admin/lib/notifications"
import { useTRPC } from "@admin/lib/trpc-client"
import type { CommitteeApplicationPeriod } from "@dotkomonline/rpc/committee-application"
import { Button } from "@dotkomonline/ui"
import { IconArrowBackUp } from "@tabler/icons-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const useRevertInterviewPublicationAndMatchingMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()

  return useMutation(
    trpc.committeeApplication.revertInterviewPublicationAndMatching.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Tilbakestiller...",
          message: "Matchingen og publiseringen av intervjuene blir tilbakestilt.",
        })
      },
      onSuccess: async (_data, variables) => {
        notification.complete({
          title: "Tilbakestilt",
          message: "Matchingen og publiseringen av intervjuene har blitt tilbakestilt.",
        })
        await queryClient.invalidateQueries(
          trpc.committeeApplication.getPeriodById.queryOptions({ applicationPeriodId: variables.applicationPeriodId })
        )
        await queryClient.invalidateQueries(
          trpc.committeeApplication.getInterviewSchedule.queryOptions({
            applicationPeriodId: variables.applicationPeriodId,
          })
        )
        await queryClient.invalidateQueries(
          trpc.committeeApplication.findManyGroupMatchings.queryOptions({
            applicationPeriodId: variables.applicationPeriodId,
          })
        )
      },
      onError: (err) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under tilbakestillingen: ${err.toString()}.`,
          error: err,
        })
      },
    })
  )
}

type ForTestingRevertPublishingAndMatchingProps = {
  applicationPeriod: CommitteeApplicationPeriod
}

export function ForTestingRevertPublishingAndMatching({ applicationPeriod }: ForTestingRevertPublishingAndMatchingProps) {
  const revert = useRevertInterviewPublicationAndMatchingMutation()

  return (
    <Button
      variant="outline"
      icon={<IconArrowBackUp className="size-3.5" />}
      disabled={revert.isPending}
      onClick={() => revert.mutate({ applicationPeriodId: applicationPeriod.id })}
    >
      Tilbakestill matching og publisering for {applicationPeriod.name}
    </Button>
  )
}
