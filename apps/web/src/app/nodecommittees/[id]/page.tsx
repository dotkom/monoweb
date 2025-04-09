// import { NodeCommitteeView } from "@/components/views/NodeCommitteeView"
import { server } from "@/utils/trpc/server"

const NodeCommitteePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const nodecommittee = await server.group.getByType.query({ groupId: id, type: "NODECOMMITTEE" })
  const nodecommitteeEvents = await server.event.allByGroup.query({ id })
  const members = await server.group.getMembers.query(id)

  // return <NodeCommitteeView nodecommittee={nodecommittee} events={nodecommitteeEvents} members={members} />
}

export default NodeCommitteePage
