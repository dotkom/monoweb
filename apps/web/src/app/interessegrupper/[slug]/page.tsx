import { GroupPage } from "@/app/komiteer/components/GroupPage"

interface InterestGroupPageProps {
  params: Promise<{ slug: string }>
}

const InterestGroupPage = ({ params }: InterestGroupPageProps) => {
  return <GroupPage groupType="INTEREST_GROUP" params={params} />
}

export default InterestGroupPage
