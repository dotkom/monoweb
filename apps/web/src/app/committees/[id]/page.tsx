import { CommitteeView } from "@/components/views/CommitteeView"
import { server } from "@/utils/trpc/server"

export const generateStaticParams = async () => {
  const committeeIds = await server.committee.allIds.query()
  return committeeIds.map((id) => ({ id }))
}

const CommitteePage = async ({ params: { id } }: { params: { id: string } }) => {
  const committee = await server.committee.get.query(id)
  const committeeEvents = await server.event.allByCommittee.query({ id })

  return <CommitteeView committee={committee} events={committeeEvents} />
}

export default CommitteePage
