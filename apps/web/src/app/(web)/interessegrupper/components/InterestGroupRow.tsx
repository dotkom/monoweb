import { GroupLogo } from "@/components/atoms/GroupLogo"
import { createGroupPageUrl, getGroupDisplayName, type Group } from "@dotkomonline/rpc/group"
import { Button, cn, Popover, PopoverContent, PopoverTrigger, Text } from "@dotkomonline/ui"
import { IconBell, IconBellFilled, IconShieldFilled } from "@tabler/icons-react"
import { Link } from "src/components/link"

const membershipButtonClassName =
  "flex size-8 shrink-0 items-center justify-center rounded-lg hover:bg-blue-100 dark:hover:bg-stone-700"

interface Props {
  interestGroup: Group
  isSelected: boolean
  isMember: boolean
  hasAppointedRole: boolean
  isLeader: boolean
  onClick: () => void
  onMembershipToggleClick: () => void
  isLoggedIn: boolean
}

export const InterestGroupRow = ({
  interestGroup,
  isSelected,
  isMember,
  hasAppointedRole,
  isLeader,
  onClick,
  onMembershipToggleClick,
  isLoggedIn,
}: Props) => {
  const displayName = getGroupDisplayName(interestGroup)

  return (
    <div
      className={cn(
        "flex items-center rounded-lg hover:bg-blue-50 dark:hover:bg-stone-800",
        isSelected && "bg-blue-50 hover:bg-blue-100/70 dark:bg-stone-800 dark:hover:bg-stone-700/60"
      )}
    >
      <Button
        variant="unstyled"
        className="flex-1 min-w-0 justify-start gap-2 px-3 py-1.5 text-left font-normal text-sm"
        onClick={onClick}
        title={displayName}
      >
        <GroupLogo
          src={interestGroup.imageUrl}
          alt={displayName}
          height={20}
          width={20}
          containerClassName="shrink-0 rounded-full size-5 bg-gray-50 dark:bg-stone-700"
        />
        <span className="truncate">{displayName}</span>
      </Button>
      {isLoggedIn && (
        <MembershipToggleButton
          displayName={displayName}
          interestGroup={interestGroup}
          isMember={isMember}
          hasAppointedRole={hasAppointedRole}
          isLeader={isLeader}
          onClick={onMembershipToggleClick}
        />
      )}
    </div>
  )
}

const MembershipToggleButton = ({
  displayName,
  interestGroup,
  isMember,
  hasAppointedRole,
  onClick,
  isLeader,
}: {
  displayName: string
  interestGroup: Group
  isMember: boolean
  hasAppointedRole: boolean
  isLeader: boolean
  onClick: () => void
}) => {
  if (hasAppointedRole) {
    return <AppointedRoleButton displayName={displayName} isLeader={isLeader} interestGroup={interestGroup} />
  }

  const label = isMember ? `Meld deg ut av ${displayName}` : `Bli medlem av ${displayName}`

  return (
    <Button variant="unstyled" onClick={onClick} aria-label={label} className={membershipButtonClassName}>
      {isMember ? <IconBellFilled className="text-blue-500" /> : <IconBell />}
    </Button>
  )
}

const AppointedRoleButton = ({
  displayName,
  isLeader,
  interestGroup,
}: {
  displayName: string
  isLeader: boolean
  interestGroup: Group
}) => {
  if (isLeader) {
    return (
      <Button
        variant="unstyled"
        element={Link}
        href={createGroupPageUrl(interestGroup)}
        aria-label={`Administrer ${displayName}`}
        title={`Administrer ${displayName}`}
        className={membershipButtonClassName}
      >
        <IconShieldFilled className="text-amber-500 dark:text-amber-400" />
      </Button>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="unstyled"
          aria-label={`Du har en rolle i ${displayName}`}
          className={membershipButtonClassName}
        >
          <IconShieldFilled className="text-amber-500 dark:text-amber-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" initialFocus={false}>
        <Text>
          Du har en aktiv rolle i gruppen og kan ikke melde deg ut selv. Kontakt Backlog dersom du vil forlate gruppen.
        </Text>
      </PopoverContent>
    </Popover>
  )
}
