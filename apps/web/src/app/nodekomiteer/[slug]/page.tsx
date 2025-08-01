import { CommitteePage } from "@/app/komiteer/components/CommiteePage"

interface NodeCommitteePageProps {
  params: Promise<{ slug: string }>
}

const NodeCommitteePage = ({ params }: NodeCommitteePageProps) => {
  return <CommitteePage params={params} groupType="NODE_COMMITTEE" />
}

export default NodeCommitteePage
