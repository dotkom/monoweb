import type { EventId, FeedbackPublicResultsToken } from "@dotkomonline/types"
import { FeedbackResults } from "@/app/tilbakemelding/components/FeedbackResults"
import { server } from "@/utils/trpc/server"

interface Props {
  eventId: EventId
  publicResultsToken?: FeedbackPublicResultsToken
}

export const FeedbackAnswersPage = async ({ eventId, publicResultsToken }: Props) => {
  const { event, attendance } = await server.event.get.query(eventId)
  const feedbackForm = publicResultsToken
    ? await server.event.feedback.getPublicForm.query(publicResultsToken)
    : await server.event.feedback.getFormByEventId.query(eventId)

  const answers = publicResultsToken
    ? await server.event.feedback.getPublicAnswers.query(publicResultsToken)
    : await server.event.feedback.getAllAnswers.query(feedbackForm.id)

  return (
    <FeedbackResults
      questions={feedbackForm.questions}
      answers={answers}
      attendees={attendance?.attendees ?? []}
      event={event}
      pools={attendance?.pools ?? []}
      publicResultsToken={publicResultsToken}
    />
  )
}
