import { GroupListItem } from "@/components/molecules/GroupListItem"
import type { Group } from "@dotkomonline/rpc/group"
import type { FC } from "react"

interface GroupListProps {
  groups: Group[]
}

export const GroupList: FC<GroupListProps> = ({ groups }) => {
  const orderedGroups = groups.toSorted((a, b) => {
    // Inactive groups last
    if (a.deactivatedAt !== null && b.deactivatedAt === null) return 1
    if (b.deactivatedAt !== null && a.deactivatedAt === null) return -1

    // Then by name (alphabetical)
    return a.name?.localeCompare(b.name ?? "") ?? 0
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {orderedGroups.map((group) => (
        <GroupListItem key={group.slug} group={group} />
      ))}
    </div>
  )
}
