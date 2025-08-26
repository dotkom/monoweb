import { GroupListItem } from "@/components/molecules/GroupListItem"
import type { Group } from "@dotkomonline/types"
import type { FC } from "react"

interface GroupListProps {
  groups: Group[]
}

export const GroupList: FC<GroupListProps> = ({ groups }) => {
  const randomizedGroups = groups
    .toSorted(() => Math.random() - 0.5)
    // Makes inactive come last
    .toSorted((a, b) => (Boolean(a.deactivatedAt) === Boolean(b.deactivatedAt) ? 0 : a.deactivatedAt ? 1 : -1))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
      {randomizedGroups.map((group) => (
        <GroupListItem key={group.slug} group={group} />
      ))}
    </div>
  )
}
