import { FeedbackResults } from "@/app/tilbakemelding/components/FeedbackResults"
import { server } from "@/utils/trpc/server"
import type { EventId, FeedbackPublicResultsToken } from "@dotkomonline/types"

interface Props {
  eventId: EventId
  publicResultsToken?: FeedbackPublicResultsToken
}

export const FeedbackPage = async ({ eventId, publicResultsToken }: Props) => {
  const event = await server.event.get.query(eventId)

  const feedbackForm = publicResultsToken
    ? await server.event.feedback.getFormByPublicResultsToken.query(publicResultsToken)
    : await server.event.feedback.getFormByEventid.query(eventId)

  const answers = publicResultsToken
    ? await server.event.feedback.getAnswersByPublicResultsToken.query(publicResultsToken)
    : await server.event.feedback.getAllAnswers.query(feedbackForm.id)

  const attendees = event.attendanceId
    ? await server.attendance.getAttendees.query({ attendanceId: event.attendanceId })
    : []

  const attendance = event.attendanceId ? await server.attendance.getAttendance.query({ id: event.attendanceId }) : null

  return (
    <FeedbackResults
      answers={answers}
      questions={feedbackForm.questions}
      attendees={attendees}
      event={event}
      pools={attendance?.pools ?? []}
    />
  )
}
