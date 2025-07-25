import { CommitteePage } from "@/app/komiteer/components/CommiteePage"

interface OtherGroupsPageProps {
  params: Promise<{ slug: string }>
}

const OtherGroupsPage = ({ params }: OtherGroupsPageProps) => {
  return <CommitteePage params={params} groupType="OTHERGROUP" />
}

export default OtherGroupsPage
