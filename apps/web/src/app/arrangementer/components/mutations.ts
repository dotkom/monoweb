import { useTRPC } from "@/utils/trpc/client"
import { useSession } from "@dotkomonline/oauth2/react"

import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useDeregisterMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const session = useSession()

  return useMutation(
    trpc.event.attendance.deregisterForEvent.mutationOptions({
      onSuccess: async (_, input) => {
        if (!session) {
          return
        }

        await Promise.all([
          await queryClient.invalidateQueries(trpc.attendance.getAttendance.queryOptions({ id: input.attendanceId })),
          await queryClient.invalidateQueries(
            trpc.attendance.getAttendees.queryOptions({ attendanceId: input.attendanceId })
          ),
        ])
      },
    })
  )
}

interface UseRegisterMutationInput {
  onSuccess?: () => void
}

export const useRegisterMutation = ({ onSuccess }: UseRegisterMutationInput) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.event.attendance.registerForEvent.mutationOptions({
      onSuccess: async (data) => {
        await Promise.all([
          queryClient.invalidateQueries(trpc.attendance.getAttendees.queryOptions({ attendanceId: data.attendanceId })),
          queryClient.invalidateQueries(trpc.attendance.getAttendance.queryOptions({ id: data.attendanceId })),
        ])

        onSuccess?.()
      },
    })
  )
}

export const useSetSelectionsOptionsMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.attendance.updateSelectionResponses.mutationOptions({
      onSuccess: async ({ userId, attendanceId }) => {
        await queryClient.invalidateQueries(trpc.attendance.getAttendee.queryOptions({ userId, attendanceId }))
      },
    })
  )
}

interface useCreateFeedbackAnswerMutationInput {
  onSuccess?: () => void
}

export const useCreateFeedbackAnswerMutation = ({ onSuccess }: useCreateFeedbackAnswerMutationInput) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.event.feedback.createAnswer.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(
          trpc.event.feedback.findAnswerByAttendee.queryOptions({
            formId: data.feedbackFormId,
            attendeeId: data.attendeeId,
          })
        )
        await queryClient.invalidateQueries(trpc.event.feedback.getAllAnswers.queryOptions(data.feedbackFormId))

        onSuccess?.()
      },
      onError: (error) => {
        alert("Noe gikk galt")
        console.error(error)
      },
    })
  )
}
