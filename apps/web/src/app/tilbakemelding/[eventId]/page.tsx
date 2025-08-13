import { EventFeedbackForm } from "@/app/tilbakemelding/components/FeedbackForm"
import { auth } from "@/auth"
import { server } from "@/utils/trpc/server"
import { Text, Title } from "@dotkomonline/ui"
import { formatDate } from "date-fns"
import { isAfter } from "date-fns"

const EventFeedbackPage = async ({ params }: { params: Promise<{ eventId: string }> }) => {
  const { eventId } = await params
  const session = await auth.getServerSession()
  const { event, attendance } = await server.event.get.query(eventId)
  const feedbackForm = await server.event.feedback.findFormByEventId.query(eventId)

  if (!feedbackForm || !feedbackForm.isActive)
    return <Text>Dette arrangementet har ikke et tilbakemeldingsskjema.</Text>

  const user = session ? await server.user.getMe.query() : undefined

  const attendee = user && attendance?.attendees?.find((attendee) => attendee.userId === user.id)
  if (!attendee) return <Text>Du kan ikke svare på dette skjemaet.</Text>

  const previousAnswer = await server.event.feedback.findAnswerByAttendee.query({
    formId: feedbackForm.id,
    attendeeId: attendee.id,
  })

  if (previousAnswer) return <Text>Du har allerede svart på dette skjemaet.</Text>

  if (isAfter(event.end, Date.now()))
    return (
      <Text>
        Du kan ikke sende inn tilbakemelding før arrangementet er over {formatDate(event.end, "dd.MM.yyyy HH:mm")}.
      </Text>
    )

  return (
    <div>
      <div className="flex flex-col gap-2 border-b border-gray-600">
        <Title element="h1" className="text-3xl">
          Tilbakemelding
        </Title>
        <Text className="text-gray-800 dark:text-stone-300">Gi tilbakemelding på {event.title}</Text>
      </div>

      <div className="mt-8">
        <EventFeedbackForm feedbackForm={feedbackForm} attendee={attendee} />
      </div>
    </div>
  )
}

export default EventFeedbackPage
