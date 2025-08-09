import { GroupPage } from "@/app/komiteer/components/GroupPage"

interface OtherGroupsPageProps {
  params: Promise<{ slug: string }>
}

const OtherGroupsPage = ({ params }: OtherGroupsPageProps) => {
  return <GroupPage params={params} groupType="ASSOCIATED" />
}

export default OtherGroupsPage
