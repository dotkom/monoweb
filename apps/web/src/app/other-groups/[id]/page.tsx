import { OtherGroupView } from "@/components/views/OtherGroupView"
import { server } from "@/utils/trpc/server"

const OtherGroupPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const otherGroup = await server.group.getByType.query({ groupId: id, type: "OTHERGROUP" })

    return <OtherGroupView otherGroup={otherGroup} />
}

export default OtherGroupPage
