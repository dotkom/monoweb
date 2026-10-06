import { GroupLogo } from "@/components/atoms/GroupLogo"
import { createGroupPageUrl, getGroupDisplayName, type Group, type GroupMembership } from "@dotkomonline/rpc/group"
import { IconArrowRight } from "@tabler/icons-react"
import Link from "next/link"
import { InterestGroupEventMobileFilters } from "./InterestGroupEventMobileFilters"

interface Props {
  interestGroups: Group[]
  currentUserInterestGroups: Group[]
  currentUserGroupMemberships: GroupMembership[]
  selectedInterestGroup: Group | null
  onSelectInterestGroup: (interestGroup: Group | null) => void
  onMembershipToggle: (interestGroupId: string) => void
  isLoggedIn: boolean
}

export const InterestGroupEventToolbar = ({
  interestGroups,
  currentUserInterestGroups,
  currentUserGroupMemberships,
  selectedInterestGroup,
  onSelectInterestGroup,
  onMembershipToggle,
  isLoggedIn,
}: Props) => {
  return (
    <div className="flex h-9 items-center gap-3">
      {selectedInterestGroup !== null && (
        <div className="hidden lg:flex items-center gap-2 text-sm font-medium">
          <GroupLogo
            src={selectedInterestGroup.imageUrl}
            alt={getGroupDisplayName(selectedInterestGroup)}
            height={20}
            width={20}
            containerClassName="rounded-full size-5 bg-gray-50 dark:bg-stone-700"
          />
          {getGroupDisplayName(selectedInterestGroup)}
        </div>
      )}

      <InterestGroupEventMobileFilters
        interestGroups={interestGroups}
        currentUserInterestGroups={currentUserInterestGroups}
        currentUserGroupMemberships={currentUserGroupMemberships}
        selectedInterestGroup={selectedInterestGroup}
        onSelectInterestGroup={onSelectInterestGroup}
        onMembershipToggle={onMembershipToggle}
        isLoggedIn={isLoggedIn}
      />

      {selectedInterestGroup !== null && (
        <Link
          href={createGroupPageUrl(selectedInterestGroup)}
          className="group flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Om gruppen
          <IconArrowRight className="size-4 motion-safe:transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  )
}
