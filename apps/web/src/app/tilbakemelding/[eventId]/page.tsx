import type { Attendee, Event, FeedbackForm, FeedbackRejectionCause } from "@dotkomonline/types"
import { Text, Title } from "@dotkomonline/ui"
import { EventFeedbackForm } from "@/app/tilbakemelding/components/FeedbackForm"
import { server } from "@/utils/trpc/server"

function getFailureMessage(cause: FeedbackRejectionCause) {
  switch (cause) {
    case "ALREADY_ANSWERED":
      return "Du har allerede svart på dette skjemaet."
    case "DID_NOT_ATTEND":
      return "Du kan ikke svare på dette skjemaet."
    case "TOO_EARLY":
      return "Tilbakemelding er ikke tilgjengelig ennå."
    case "TOO_LATE":
      return "Fristen for å gi tilbakemelding har utløpt."
    case "NO_FEEDBACK_FORM":
      return "Dette arrangementet har ikke et tilbakemeldingsskjema."
  }
}

const EventFeedbackPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ preview: string }>
}) => {
  const { eventId } = await params
  const { preview } = await searchParams
  const isPreview = preview === "true"

  const feedbackForm = await server.event.feedback.getFormByEventId.query(eventId)

  if (isPreview) {
    const staffPreview = await server.event.feedback.getFeedbackFormStaffPreview.query(feedbackForm.id)

    return <PageContent event={staffPreview.event} feedbackForm={staffPreview.feedbackForm} isPreview={true} />
  }

  const feedbackEligibility = await server.event.feedback.getFeedbackEligibility.query(feedbackForm.id)

  if (feedbackEligibility.success) {
    return (
      <PageContent
        event={feedbackEligibility.event}
        attendee={feedbackEligibility.attendee}
        feedbackForm={feedbackEligibility.feedbackForm}
        isPreview={false}
      />
    )
  }

  const failureMessage = getFailureMessage(feedbackEligibility.cause)

  return <Text>{failureMessage}</Text>
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
