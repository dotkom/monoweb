import { OtherGroupListItem } from "@/components/molecules/OtherGroupListItem"
import { server } from "@/utils/trpc/server"

export const OtherGroupList = async () => {
  const otherGroups = await server.group.allByType.query("OTHERGROUP")

  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] w-10/12 2xl:grid-cols-4 gap-12 mx-auto">
      {otherGroups.map((otherGroup, index) => (
        <OtherGroupListItem key={otherGroup.id} otherGroup={otherGroup} />
      ))}
    </div>
  )
}
