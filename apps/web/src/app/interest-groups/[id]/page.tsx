import { auth } from "@/auth"
import InterestGroupView from "@/components/views/InterestGroupView/InterestGroupView"

const InterestPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const session = await auth()

  return <InterestGroupView interestGroupId={id} sessionUser={session?.user} />
}

export default InterestPage
