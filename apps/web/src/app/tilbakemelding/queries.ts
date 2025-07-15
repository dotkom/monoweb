import { useTRPC } from "@/utils/trpc/client"
import type { FeedbackFormAnswer, FeedbackFormId, FeedbackPublicResultsToken } from "@dotkomonline/types"
import { useQuery } from "@tanstack/react-query"

export const useFeedbackAnswersGetQuery = (id: FeedbackFormId, publicResultsToken?: FeedbackPublicResultsToken) => {
  const trpc = useTRPC()

  const initialAnswers: FeedbackFormAnswer[] = []

  const queryOptions = publicResultsToken
    ? trpc.event.feedback.getPublicAnswers.queryOptions(publicResultsToken, {
        initialData: initialAnswers,
      })
    : trpc.event.feedback.getAllAnswers.queryOptions(id, { initialData: initialAnswers })

  const { data: answers } = useQuery(queryOptions)

  return answers
}
