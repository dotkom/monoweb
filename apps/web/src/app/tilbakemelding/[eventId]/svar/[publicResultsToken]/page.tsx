import { FeedbackPage } from "@/app/tilbakemelding/components/FeedbackAnswersPage"

const EventPublicFeedbackPage = async ({
  params,
}: { params: Promise<{ eventId: string; publicResultsToken: string }> }) => {
  const { eventId, publicResultsToken } = await params

  return <FeedbackPage eventId={eventId} publicResultsToken={publicResultsToken} />
}

export default EventPublicFeedbackPage
