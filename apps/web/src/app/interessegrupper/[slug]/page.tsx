import { GroupPage } from "@/app/grupper/components/GroupPage"

interface InterestGroupPageProps {
  params: Promise<{ slug: string }>
}

const InterestGroupPage = ({ params }: InterestGroupPageProps) => {
  return <GroupPage params={params} />
}

export default InterestGroupPage
