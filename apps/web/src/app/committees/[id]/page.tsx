import { CommitteeView } from "@/components/views/CommitteeView"
import { server } from "@/utils/trpc/server"

const CommitteePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const committee = await server.committee.get.query(id)
  const committeeEvents = await server.event.allByCommittee.query({ id })

  return <CommitteeView committee={committee} events={committeeEvents} />
}

export default CommitteePage
