import CommitteeListItem from "@/components/molecules/CommitteListItem"
import { server } from "@/utils/trpc/server"

export const CommitteeList = async () => {
  const committees = await server.group.allByType.query("COMMITTEE")

  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] w-10/12 2xl:grid-cols-4 gap-12 mx-auto">
      {committees.map((committee) => (
        <CommitteeListItem key={committee.id} committee={committee} />
      ))}
    </div>
  )
}
