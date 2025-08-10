import { GroupListItem } from "@/components/molecules/GroupListItem"
import type { Group } from "@dotkomonline/types"
import type { FC } from "react"

interface GroupListProps {
  groups: Group[]
}

export const GroupList: FC<GroupListProps> = ({ groups }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(22rem,1fr))] gap-3 md:gap-6">
    {groups.map((group) => (
      <GroupListItem key={group.slug} group={group} />
    ))}
  </div>
)
