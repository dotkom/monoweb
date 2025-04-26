import { auth } from "@/auth"
import { InterestGroupView } from "@/components/views/InterestGroupView/InterestGroupView"

const InterestPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const session = await auth.getServerSession()

  return <InterestGroupView interestGroupId={id} session={session} />
}

export default InterestPage
