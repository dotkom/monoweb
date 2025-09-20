import { GroupPage } from "../components/GroupPage"

interface CommitteePageProps {
  params: Promise<{ slug: string }>
}

export default function Page({ params }: CommitteePageProps) {
  return <GroupPage params={params} />
}
