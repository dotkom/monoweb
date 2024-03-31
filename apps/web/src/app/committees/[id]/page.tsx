import { CommitteeView } from "@/components/views/CommitteeView"
import { getServerClient, getUnauthorizedServerClient } from "@/utils/trpc/serverClient"

export const generateStaticParams = async () => {
  const serverClient = await getUnauthorizedServerClient()
  const committeeIds = await serverClient.committee.allIds()
  return committeeIds.map((id) => ({ id }))
}

const CommitteePage = async ({ params: { id } }: { params: { id: string } }) => {
  const serverClient = await getServerClient()
  const committee = await serverClient.committee.get(id)
  const committeeEvents = await serverClient.event.allByCommittee({ id })

  return <CommitteeView committee={committee} events={committeeEvents} />
}

export default CommitteePage
