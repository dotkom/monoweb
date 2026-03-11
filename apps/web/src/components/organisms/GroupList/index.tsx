import { GroupListItem } from "@/components/molecules/GroupListItem"
import type { Group } from "@dotkomonline/types"
import { compareAsc } from "date-fns"
import type { FC } from "react"

interface GroupListProps {
  groups: Group[]
}

export const GroupList: FC<GroupListProps> = ({ groups }) => {
  const orderedGroups = groups.toSorted((a, b) => {
    // Inactive groups last
    if (a.deactivatedAt !== null && b.deactivatedAt === null) return 1
    if (b.deactivatedAt !== null && a.deactivatedAt === null) return -1
    // Most events first
    if ((b.eventCount ?? 0) !== (a.eventCount ?? 0)) return (b.eventCount ?? 0) - (a.eventCount ?? 0)
    // Then by creation time (oldest first)
    return compareAsc(a.createdAt, b.createdAt)
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
      {orderedGroups.map((group) => (
        <GroupListItem key={group.slug} group={group} />
      ))}
    </div>
  )
}
