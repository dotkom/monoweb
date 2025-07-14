import { FeedbackAnswersPage } from "../../components/FeedbackAnswersPage"

const EventPublicFeedbackPage = async ({ params }: { params: Promise<{ eventId: string }> }) => {
  const { eventId } = await params

  return <FeedbackAnswersPage eventId={eventId} />
}

export default EventPublicFeedbackPage
