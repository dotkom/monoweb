import { CommitteeView } from "@/components/views/CommitteeView"
import { server } from "@/utils/trpc/server"

export const generateStaticParams = async () => {
  const committeeIds = await server.group.allIdsByType.query("COMMITTEE")
  return committeeIds.map((id) => ({ id }))
}

const CommitteePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const committee = await server.group.getByType.query({ groupId: id, type: "COMMITTEE" })
  const committeeEvents = await server.event.allByGroup.query({ id })

  return <CommitteeView committee={committee} events={committeeEvents} />
}

export default CommitteePage
