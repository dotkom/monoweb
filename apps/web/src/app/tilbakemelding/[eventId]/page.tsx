import { EventFeedbackForm } from "@/app/tilbakemelding/components/FeedbackForm"
import { auth } from "@/auth"
import { server } from "@/utils/trpc/server"
import type { Attendee, Event, FeedbackForm } from "@dotkomonline/types"
import { Text, Title } from "@dotkomonline/ui"
import { formatDate, isAfter, isPast } from "date-fns"

const EventFeedbackPage = async ({
  params,
  searchParams,
}: { params: Promise<{ eventId: string }>; searchParams: Promise<{ preview: string }> }) => {
  const { eventId } = await params
  const { preview: requestedPreview } = await searchParams
  const session = await auth.getServerSession()

  const { event, attendance } = await server.event.get.query(eventId)
  const feedbackForm = await server.event.feedback.findFormByEventId.query(eventId)

  if (!feedbackForm) {
    return <Text>Dette arrangementet har ikke et tilbakemeldingsskjema.</Text>
  }

  // Preview skips validation, but can't submit the form
  const isPreview = requestedPreview && (await server.user.isStaff.query())
  if (isPreview) {
    return <PageContent event={event} feedbackForm={feedbackForm} isPreview={true} />
  }

  if (!feedbackForm.isActive) {
    return <Text>Tilbakemeldingsskjemaet er ikke åpent.</Text>
  }

  const user = session ? await server.user.getMe.query() : undefined

  const attendee = user && attendance?.attendees?.find((attendee) => attendee.userId === user.id)

  if (!attendee || !attendee.attendedAt) {
    return <Text>Du kan ikke svare på dette skjemaet.</Text>
  }

  const previousAnswer = await server.event.feedback.findAnswerByAttendee.query({
    formId: feedbackForm.id,
    attendeeId: attendee.id,
  })
  if (previousAnswer) return <Text>Du har allerede svart på dette skjemaet.</Text>

  if (isPast(feedbackForm.answerDeadline)) {
    return <Text>Fristen for å gi tilbakemelding har utløpt.</Text>
  }

  if (isAfter(event.end, Date.now())) {
    return (
      <Text>
        Du kan ikke sende inn tilbakemelding før arrangementet er over {formatDate(event.end, "dd.MM.yyyy HH:mm")}.
      </Text>
    )
  }

  return <PageContent event={event} feedbackForm={feedbackForm} isPreview={false} attendee={attendee} />
}

export default EventFeedbackPage

interface PageContentProps {
  event: Event
  isPreview: boolean
  attendee?: Attendee
  feedbackForm: FeedbackForm
}

const PageContent = ({ event, isPreview, attendee, feedbackForm }: PageContentProps) => (
  <div>
    <div className="flex flex-col gap-2 border-b border-gray-600">
      <Title element="h1" className="text-3xl">
        Tilbakemelding
        {isPreview && " [Forhåndsvisning]"}
      </Title>
      <Text className="text-gray-800 dark:text-stone-300">Gi tilbakemelding på {event.title}</Text>
    </div>

    <div className="mt-8">
      <EventFeedbackForm feedbackForm={feedbackForm} attendee={attendee} preview={isPreview} />
    </div>
  </div>
)
