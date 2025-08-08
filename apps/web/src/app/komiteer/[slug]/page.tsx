import { CommitteePage } from "../components/CommiteePage"

interface CommitteePageProps {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: CommitteePageProps) {
  const { slug } = await params
  return <CommitteePage groupType="COMMITTEE" groupId={slug} />
}
