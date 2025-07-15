import { FeedbackAnswersPage } from "../../components/FeedbackAnswersPage"

const PrivateFeedbackAnswersPage = async ({ params }: { params: Promise<{ eventId: string }> }) => {
  const { eventId } = await params

  return <FeedbackAnswersPage eventId={eventId} />
}

export default PrivateFeedbackAnswersPage
