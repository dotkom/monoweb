import { InterestGroupListItem } from "@/components/molecules/InterestGroupListItem"
import { server } from "@/utils/trpc/server"

export const InterestGroupList = async () => {
  const interestGroups = await server.interestGroup.all.query()

  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] w-10/12 2xl:grid-cols-4 gap-12 mx-auto">
      {interestGroups.map((interestGroup, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: This is a static list
        <InterestGroupListItem key={index} interestGroup={interestGroup} />
      ))}
    </div>
  )
}
