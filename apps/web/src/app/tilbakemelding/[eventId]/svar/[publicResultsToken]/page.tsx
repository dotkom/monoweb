import { FeedbackAnswersPage } from "@/app/tilbakemelding/components/FeedbackAnswersPage"

const PublicFeedbackAnswersPage = async ({
  params,
}: { params: Promise<{ eventId: string; publicResultsToken: string }> }) => {
  const { eventId, publicResultsToken } = await params

  return <FeedbackAnswersPage eventId={eventId} publicResultsToken={publicResultsToken} />
}

export default PublicFeedbackAnswersPage
