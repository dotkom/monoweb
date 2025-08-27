import { GroupListItem } from "@/components/molecules/GroupListItem"
import type { Group } from "@dotkomonline/types"
import type { FC } from "react"

interface GroupListProps {
  groups: Group[]
}

export const GroupList: FC<GroupListProps> = ({ groups }) => {
  const randomizedGroups = groups
    // Makes inactive come last
    .toSorted((a, b) => {
      if (a.deactivatedAt !== null && b.deactivatedAt !== null) {
        return 0
      }
      return a.deactivatedAt !== null ? 1 : a.slug.localeCompare(b.slug)
    })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
      {randomizedGroups.map((group) => (
        <GroupListItem key={group.slug} group={group} />
      ))}
    </div>
  )
}
