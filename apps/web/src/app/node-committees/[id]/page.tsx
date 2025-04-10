import { NodeCommitteeView } from "@/components/views/NodeCommitteView/NodeCommitteView"
import { server } from "@/utils/trpc/server"

const NodeCommitteePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params

  const nodeCommittee = await server.group.getByType.query({ groupId: id, type: "NODECOMMITTEE" })

  return <NodeCommitteeView nodeCommittee={nodeCommittee} />
}

export default NodeCommitteePage
