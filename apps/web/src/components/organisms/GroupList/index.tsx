import type { Group } from "@dotkomonline/types"
import type { FC } from "react"
import { GroupListItem } from "@/components/molecules/GroupListItem"

interface GroupListProps {
  groups: Group[]
}

export const GroupList: FC<GroupListProps> = ({ groups }) => {
  const orderedGroups = groups
    // Makes inactive come last
    .toSorted((a, b) => {
      if (a.deactivatedAt !== null) {
        return 1
      }
      if (b.deactivatedAt !== null) {
        return -1
      }
      return a.slug.localeCompare(b.slug)
    })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
      {orderedGroups.map((group) => (
        <GroupListItem key={group.slug} group={group} />
      ))}
    </div>
  )
}
