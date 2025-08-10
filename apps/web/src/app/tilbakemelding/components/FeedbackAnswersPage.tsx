import { FeedbackResults } from "@/app/tilbakemelding/components/FeedbackResults"
import { server } from "@/utils/trpc/server"
import type { EventId, FeedbackPublicResultsToken } from "@dotkomonline/types"

interface Props {
  eventId: EventId
  publicResultsToken?: FeedbackPublicResultsToken
}

export const FeedbackAnswersPage = async ({ eventId, publicResultsToken }: Props) => {
  const event = await server.event.get.query(eventId)
  const attendance =
    event.attendanceId !== null ? await server.attendance.getAttendance.query({ id: event.attendanceId }) : null
  const feedbackForm = publicResultsToken
    ? await server.event.feedback.getPublicForm.query(publicResultsToken)
    : await server.event.feedback.getFormByEventid.query(eventId)

  return (
    <FeedbackResults
      questions={feedbackForm.questions}
      attendees={attendance?.attendees ?? []}
      event={event}
      pools={attendance?.pools ?? []}
      publicResultsToken={publicResultsToken}
      feedbackFormId={feedbackForm.id}
    />
  )
}
