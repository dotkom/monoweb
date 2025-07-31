import type { Company, Group } from "@dotkomonline/types"
import { Anchor, Group as MantineGroup, Text } from "@mantine/core"
import Link from "next/link"
import type { FC } from "react"

export type EventHostingGroupListProps = {
  groups: Group[]
  companies: Company[]
}

/**
 * Component for displaying a list of groups that are hosting an event
 *
 * This list is strictly ordered based on the highest interest priority. The
 * order is companies then groups.
 */
export const EventHostingGroupList: FC<EventHostingGroupListProps> = ({ groups, companies }) => {
  // Nobody is set as organizer yet
  if (groups.length === 0 && companies.length === 0) {
    return <Text>Ingen arrangører</Text>
  }

  return (
    <MantineGroup>
      {companies.map((company) => (
        <Anchor key={company.id} component={Link} size="sm" href={`/company/${company.slug}`}>
          {company.name}
        </Anchor>
      ))}
      {groups.map((group) => (
        <Anchor key={group.slug} component={Link} size="sm" href={`/group/${group.slug}`}>
          {group.name}
        </Anchor>
      ))}
    </MantineGroup>
  )
}
