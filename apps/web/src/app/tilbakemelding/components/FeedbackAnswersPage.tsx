import { FeedbackResults } from "@/app/tilbakemelding/components/FeedbackResults"
import { server } from "@/utils/trpc/server"
import type { EventId, FeedbackPublicResultsToken } from "@dotkomonline/types"

interface Props {
  eventId: EventId
  publicResultsToken?: FeedbackPublicResultsToken
}

export const FeedbackAnswersPage = async ({ eventId, publicResultsToken }: Props) => {
  const event = await server.event.get.query(eventId)

  const feedbackForm = publicResultsToken
    ? await server.event.feedback.getFormByPublicResultsToken.query(publicResultsToken)
    : await server.event.feedback.getFormByEventid.query(eventId)

  const attendees = event.attendanceId
    ? await server.attendance.getAttendees.query({ attendanceId: event.attendanceId })
    : []

  const attendance = event.attendanceId ? await server.attendance.getAttendance.query({ id: event.attendanceId }) : null

  return (
    <FeedbackResults
      questions={feedbackForm.questions}
      attendees={attendees}
      event={event}
      pools={attendance?.pools ?? []}
      publicResultsToken={publicResultsToken}
      feedbackFormId={feedbackForm.id}
    />
  )
}
