import { InterestGroupView } from "@/components/views/InterestGroupView"
import { getServerClient, getUnauthorizedServerClient } from "@/utils/trpc/serverClient"
import { notFound } from "next/navigation"

export const generateStaticParams = async () => {
  const serverClient = await getUnauthorizedServerClient()
  const interestGroups = await serverClient.interestGroup.all()
  return interestGroups.data
}

const InterestGroupPage = async ({ params: { id } }: { params: { id: string } }) => {
  const serverClient = await getServerClient()
  const interestGroup = await serverClient.interestGroup.get(id)

  if (!interestGroup) {
    return notFound()
  }

  return <InterestGroupView interestGroup={interestGroup} />
}

export default InterestGroupPage
