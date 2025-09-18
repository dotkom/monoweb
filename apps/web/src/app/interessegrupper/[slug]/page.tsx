import { GroupPage } from "@/app/komiteer/components/GroupPage"

interface InterestGroupPageProps {
  params: Promise<{ slug: string }>
}

const InterestGroupPage = ({ params }: InterestGroupPageProps) => {
  return <GroupPage params={params} />
}

export default InterestGroupPage
