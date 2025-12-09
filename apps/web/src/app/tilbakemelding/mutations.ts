import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "@/utils/trpc/client"

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
          trpc.event.feedback.findOwnAnswerByAttendee.queryOptions({
            formId: data.feedbackFormId,
            attendeeId: data.attendeeId,
          })
        )
        await queryClient.invalidateQueries(trpc.event.feedback.getAllAnswers.queryOptions(data.feedbackFormId))
        await queryClient.invalidateQueries({ queryKey: trpc.event.feedback.getPublicAnswers.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.event.findUnansweredByUser.queryKey() })

        onSuccess?.()
      },
      onError: (error) => {
        alert("Noe gikk galt")
        console.error(error)
      },
    })
  )
}

export const useDeleteFeedbackQuestionAnswerMutation = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.event.feedback.deleteQuestionAnswer.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.event.feedback.getAllAnswers.queryKey() })
        await queryClient.invalidateQueries({ queryKey: trpc.event.feedback.getPublicAnswers.queryKey() })
      },
      onError: (error) => {
        alert("Noe gikk galt")
        console.error(error)
      },
    })
  )
}
