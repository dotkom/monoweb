import { CommitteePage } from "@/app/komiteer/components/CommiteePage"

interface InterestGroupPageProps {
  params: Promise<{ slug: string }>
}

const InterestGroupPage = ({ params }: InterestGroupPageProps) => {
  return <CommitteePage groupType="INTEREST_GROUP" params={params} />
}

export default InterestGroupPage
