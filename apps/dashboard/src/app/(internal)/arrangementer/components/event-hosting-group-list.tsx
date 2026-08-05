import type { Company } from "@dotkomonline/rpc/company"
import { getGroupDisplayName, GroupTypeSchema, type Group } from "@dotkomonline/rpc/group"
import { Anchor, Group as MantineGroup, Text, Tooltip } from "@mantine/core"
import Link from "next/link"
import type { FC } from "react"

const MAX_GROUPS_TO_DISPLAY = 4 as const
const LEEWAY = 1 as const

export type EventHostingGroupListProps = {
  groups: Group[]
  companies: Company[]
}

const getHref = (groupOrCompany: Group | Company) => {
  const isGroup = "type" in groupOrCompany

  return isGroup ? `/grupper/${groupOrCompany.slug}` : `/bedrifter/${groupOrCompany.slug}`
}

const getName = (groupOrCompany: Group | Company) => {
  const isGroup = "type" in groupOrCompany

  return isGroup ? getGroupDisplayName(groupOrCompany) : groupOrCompany.name
}

export const EventHostingGroupList: FC<EventHostingGroupListProps> = ({ groups, companies }) => {
  const organizers = groups.filter((group) => group.type !== GroupTypeSchema.enum.INTEREST_GROUP)
  const otherGroups = [...groups.filter((group) => group.type === GroupTypeSchema.enum.INTEREST_GROUP), ...companies]

  if (organizers.length === 0) {
    return (
      <Text c="red" size="sm">
        Ingen arrangører. Kontakt HS.
      </Text>
    )
  }

  const maxSize =
    organizers.length + otherGroups.length > MAX_GROUPS_TO_DISPLAY + LEEWAY
      ? MAX_GROUPS_TO_DISPLAY
      : MAX_GROUPS_TO_DISPLAY + LEEWAY

  const groupsToDisplay = [...organizers, ...otherGroups].slice(0, maxSize)
  const remainingGroups = [...organizers, ...otherGroups].slice(maxSize)

  return (
    <MantineGroup gap="sm">
      {groupsToDisplay.map((groupOrCompany) => (
        <Anchor key={groupOrCompany.slug} component={Link} size="sm" href={getHref(groupOrCompany)}>
          {getName(groupOrCompany)}
        </Anchor>
      ))}

      {organizers.length > MAX_GROUPS_TO_DISPLAY + LEEWAY && (
        <Tooltip label={remainingGroups.map((groupOrCompany) => getName(groupOrCompany)).join(", ")}>
          <Text c="dimmed" size="sm">
            +{remainingGroups.length}
          </Text>
        </Tooltip>
      )}
    </MantineGroup>
  )
}
