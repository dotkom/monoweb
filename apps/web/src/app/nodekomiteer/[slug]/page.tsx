import { GroupPage } from "@/app/komiteer/components/GroupPage"

interface NodeCommitteePageProps {
  params: Promise<{ slug: string }>
}

const NodeCommitteePage = ({ params }: NodeCommitteePageProps) => {
  return <GroupPage params={params} groupType="NODE_COMMITTEE" />
}

export default NodeCommitteePage
