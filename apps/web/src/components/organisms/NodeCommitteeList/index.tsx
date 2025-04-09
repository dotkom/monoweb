import NodeCommitteeListItem from "@/components/molecules/NodeCommitteeListItem"
import { server } from "@/utils/trpc/server"

export const NodeCommitteeList = async () => {
  const nodeCommittee = await server.group.allByType.query("NODECOMMITTEE")

  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] w-10/12 2xl:grid-cols-4 gap-12 mx-auto">
      {nodeCommittee.map((nodeCommittee, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: This is a static list
        <NodeCommitteeListItem key={index} nodeCommittee={nodeCommittee} />
      ))}
    </div>
  )
}

export default NodeCommitteeList
