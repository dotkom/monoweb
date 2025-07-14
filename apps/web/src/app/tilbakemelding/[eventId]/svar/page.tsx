import { FeedbackPage } from "../../components/FeedbackAnswersPage"

const EventPublicFeedbackPage = async ({ params }: { params: Promise<{ eventId: string }> }) => {
  const { eventId } = await params

  return <FeedbackPage eventId={eventId} />
}

export default EventPublicFeedbackPage
