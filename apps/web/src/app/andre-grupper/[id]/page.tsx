import CommitteePage from "@/app/komiteer/[id]/page"

interface OtherGroupsPageProps {
  params: Promise<{ id: string }>
}

const OtherGroupsPage = ({ params }: OtherGroupsPageProps) => {
  return <CommitteePage params={params} groupType="OTHERGROUP" />
}

export default OtherGroupsPage
