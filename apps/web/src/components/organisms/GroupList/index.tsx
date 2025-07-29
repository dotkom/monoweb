import { GroupListItem } from "@/components/molecules/GroupListItem"
import type { Group } from "@dotkomonline/types"
import type { FC } from "react"

interface GroupListProps {
  groups: Group[]
}

export const GroupList: FC<GroupListProps> = ({ groups }) => (
  <div className="px-4 py-8 mx-auto max-w-7xl">
    <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-8">
      {groups.map((group) => (
        <GroupListItem key={group.slug} group={group} />
      ))}
    </div>
  </div>
)
