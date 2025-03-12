import { CommitteeView } from "@/components/views/CommitteeView"
import { server } from "@/utils/trpc/server"

const CommitteePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const committee = await server.group.getByType.query({ groupId: id, type: "COMMITTEE" })
  const committeeEvents = await server.event.allByGroup.query({ id })
  const members = await server.group.getMembers.query(id)

  return <CommitteeView committee={committee} events={committeeEvents} members={members} />
}

export default CommitteePage
