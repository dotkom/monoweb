import { server } from "@/utils/trpc/server"
import type { Committee, Event } from "@dotkomonline/types"
import OnlineIcon from "@/components/atoms/OnlineIcon"
import CommitteeListItem from "@/components/molecules/CommitteListItem"

export const CommitteeList = async () => {
  const committees = await server.committee.all.query()

  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] w-10/12 2xl:grid-cols-4 gap-12 mx-auto">
      {committees.data.map((committee, index) => (
        <CommitteeListItem key={index} committee={committee} />
      ))}
    </div>
  )

}

export default CommitteeList;