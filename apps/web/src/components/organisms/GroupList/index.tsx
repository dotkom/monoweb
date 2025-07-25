import { GroupListItem } from "@/components/molecules/GroupListItem"
import type { Group, InterestGroup } from "@dotkomonline/types"
import type { FC } from "react"

interface GroupListProps {
  groups: (InterestGroup | Group)[]
  baseLink: string
}

export const GroupList: FC<GroupListProps> = ({ groups, baseLink }) => (
  <div className="px-4 py-8 mx-auto max-w-7xl">
    <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-8">
      {groups.map((group) => (
        <GroupListItem
          key={group.id}
          title={group.name}
          description={group.description}
          link={`/${baseLink}/${group.id}`}
          image={group.imageUrl}
          isActive={"isActive" in group ? group.isActive : true}
        />
      ))}
    </div>
  </div>
)
