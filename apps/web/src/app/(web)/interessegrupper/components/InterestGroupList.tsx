import {
  getActiveMembershipsForGroup,
  hasGroupMembershipRoleType,
  type Group,
  type GroupMembership,
} from "@dotkomonline/rpc/group"
import { Button, cn, Text } from "@dotkomonline/ui"
import { IconCalendarEvent } from "@tabler/icons-react"
import { InterestGroupRow } from "./InterestGroupRow"

interface Props {
  interestGroups: Group[]
  currentUserInterestGroups: Group[]
  currentUserGroupMemberships: GroupMembership[]
  selectedInterestGroup: Group | null
  onSelectInterestGroup: (interestGroup: Group | null) => void
  onMembershipToggle: (interestGroupId: string) => void
  isLoggedIn: boolean
}

export const InterestGroupList = ({
  interestGroups,
  currentUserInterestGroups,
  currentUserGroupMemberships,
  selectedInterestGroup,
  onSelectInterestGroup,
  onMembershipToggle,
  isLoggedIn,
}: Props) => {
  const interestGroupsCurrentUserIsNotMemberOf = interestGroups.filter(
    (interestGroup) =>
      !currentUserInterestGroups.some(
        (currentUserInterestGroup) => currentUserInterestGroup.slug === interestGroup.slug
      )
  )

  return (
    <nav className="h-full min-h-0 overflow-hidden flex flex-col gap-4">
      <div className="flex shrink-0 flex-col gap-4">
        <Button
          variant="unstyled"
          onClick={() => onSelectInterestGroup(null)}
          className={cn(
            "flex-1 min-w-0 justify-start gap-2 px-3 py-2 text-left font-normal",
            "flex items-center rounded-lg hover:bg-blue-50 dark:hover:bg-stone-800",
            selectedInterestGroup === null &&
              "bg-blue-50 hover:bg-blue-100/70 dark:bg-stone-800 dark:hover:bg-stone-700/60"
          )}
        >
          <IconCalendarEvent className="size-5 -ml-0.5 text-muted-foreground" />
          <Text size="sm">Alle arrangementer</Text>
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {currentUserInterestGroups.length > 0 && (
          <InterestGroupListSection
            title="Dine grupper"
            interestGroups={currentUserInterestGroups}
            currentUserGroupMemberships={currentUserGroupMemberships}
            selectedInterestGroup={selectedInterestGroup}
            onSelectInterestGroup={onSelectInterestGroup}
            onMembershipToggle={onMembershipToggle}
            isLoggedIn={isLoggedIn}
          />
        )}
        {interestGroupsCurrentUserIsNotMemberOf.length > 0 && (
          <InterestGroupListSection
            title="Grupper"
            interestGroups={interestGroupsCurrentUserIsNotMemberOf}
            currentUserGroupMemberships={currentUserGroupMemberships}
            selectedInterestGroup={selectedInterestGroup}
            onSelectInterestGroup={onSelectInterestGroup}
            onMembershipToggle={onMembershipToggle}
            isLoggedIn={isLoggedIn}
          />
        )}
      </div>
    </nav>
  )
}

interface InterestGroupListSectionProps {
  title: string
  interestGroups: Group[]
  currentUserGroupMemberships: GroupMembership[]
  selectedInterestGroup: Group | null
  onSelectInterestGroup: (interestGroup: Group | null) => void
  onMembershipToggle: (interestGroupId: string) => void
  isLoggedIn: boolean
}

const InterestGroupListSection = ({
  title,
  interestGroups,
  currentUserGroupMemberships,
  selectedInterestGroup,
  onSelectInterestGroup,
  onMembershipToggle,
  isLoggedIn,
}: InterestGroupListSectionProps) => {
  return (
    <section className="flex flex-col gap-1">
      <Text className="px-3 text-xs font-medium text-muted-foreground">{title}</Text>
      <div className="flex flex-col gap-0.5">
        {interestGroups.map((interestGroup) => {
          const activeMemberships = getActiveMembershipsForGroup(currentUserGroupMemberships, interestGroup.slug)
          const hasAppointedRole = activeMemberships.some((membership) => membership.roles.length > 0)
          const isLeader = activeMemberships.some((membership) => hasGroupMembershipRoleType(membership, "LEADER"))
          const isMember = activeMemberships.length > 0

          return (
            <InterestGroupRow
              key={interestGroup.slug}
              interestGroup={interestGroup}
              isSelected={selectedInterestGroup?.slug === interestGroup.slug}
              isMember={isMember}
              hasAppointedRole={hasAppointedRole}
              isLeader={isLeader}
              onClick={() => onSelectInterestGroup(interestGroup)}
              onMembershipToggleClick={() => onMembershipToggle(interestGroup.slug)}
              isLoggedIn={isLoggedIn}
            />
          )
        })}
      </div>
    </section>
  )
}
