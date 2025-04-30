import type { Company, Group, InterestGroup } from "@dotkomonline/types"
import { Anchor, Group as MantineGroup, Text } from "@mantine/core"
import Link from "next/link"
import type { FC } from "react"

export type EventHostingGroupListProps = {
  groups: Group[]
  interestGroups: InterestGroup[]
  companies: Company[]
}

/**
 * Component for displaying a list of groups that are hosting an event
 *
 * This list is strictly ordered based on the highest interest priority. The
 * order is companies, groups, then interest groups.
 */
export const EventHostingGroupList: FC<EventHostingGroupListProps> = ({ groups, interestGroups, companies }) => {
  // Nobody is set as organizer yet
  if (groups.length === 0 && interestGroups.length === 0 && companies.length === 0) {
    return <Text>Ingen arrangører</Text>
  }

  return (
    <MantineGroup>
      {companies.map((company) => (
        <Anchor key={company.id} component={Link} size="sm" href={`/company/${company.id}`}>
          {company.name}
        </Anchor>
      ))}
      {groups.map((group) => (
        <Anchor key={group.id} component={Link} size="sm" href={`/group/${group.id}`}>
          {group.name}
        </Anchor>
      ))}
      {interestGroups.map((interestGroup) => (
        <Anchor key={interestGroup.id} component={Link} size="sm" href={`/interest-group/${interestGroup.id}`}>
          {interestGroup.name}
        </Anchor>
      ))}
    </MantineGroup>
  )
}
