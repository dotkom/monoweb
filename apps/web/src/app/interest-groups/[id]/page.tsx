import InterestGroupView from "@/components/views/InterestGroupView/InterestGroupView"
import { getServerSession } from "next-auth"

const InterestPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const session = await getServerSession()

  return <InterestGroupView interestGroupId={id} sessionUser={session?.user} />
}

export default InterestPage
