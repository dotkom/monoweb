import CommitteePage from "@/app/komiteer/[id]/page"

interface NodeCommitteePageProps {
  params: Promise<{ id: string }>
}

const NodeCommitteePage = ({ params }: NodeCommitteePageProps) => {
  return <CommitteePage params={params} groupType="NODECOMMITTEE" />
}

export default NodeCommitteePage
