import { CommitteePage } from "../components/CommiteePage"

interface CommitteePageProps {
  params: Promise<{ slug: string }>
}

export default function Page({ params }: CommitteePageProps) {
  return <CommitteePage groupType="COMMITTEE" params={params} />
}
