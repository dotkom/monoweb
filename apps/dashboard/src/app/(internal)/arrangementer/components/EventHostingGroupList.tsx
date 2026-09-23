import type { Company } from "@dotkomonline/rpc/company"
import { getGroupDisplayName, GroupTypeSchema, type Group } from "@dotkomonline/rpc/group"
import { Text, TextLink, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
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
    return <Text className="text-sm text-red-600 dark:text-red-400">Ingen arrangører. Kontakt HS.</Text>
  }

  const maxSize =
    organizers.length + otherGroups.length > MAX_GROUPS_TO_DISPLAY + LEEWAY
      ? MAX_GROUPS_TO_DISPLAY
      : MAX_GROUPS_TO_DISPLAY + LEEWAY

  const groupsToDisplay = [...organizers, ...otherGroups].slice(0, maxSize)
  const remainingGroups = [...organizers, ...otherGroups].slice(maxSize)

  return (
    <div className="flex flex-wrap gap-2">
      {groupsToDisplay.map((groupOrCompany) => (
        <TextLink key={groupOrCompany.slug} href={getHref(groupOrCompany)} className="text-sm">
          {getName(groupOrCompany)}
        </TextLink>
      ))}

      {organizers.length > MAX_GROUPS_TO_DISPLAY + LEEWAY && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Text className="text-sm text-muted-foreground">+{remainingGroups.length}</Text>
          </TooltipTrigger>
          <TooltipContent>{remainingGroups.map((groupOrCompany) => getName(groupOrCompany)).join(", ")}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
