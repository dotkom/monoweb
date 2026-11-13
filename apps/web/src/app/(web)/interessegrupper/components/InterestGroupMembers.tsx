"use client"

import type { GroupMember } from "@dotkomonline/rpc/group"
import type { UserId } from "@dotkomonline/rpc/user"
import { Button, cn, Text, Title } from "@dotkomonline/ui"
import { IconChevronDown, IconChevronUp, IconUserMinus, IconUserPlus } from "@tabler/icons-react"
import { createAuthorizeUrl } from "node_modules/@dotkomonline/utils/src"
import { useState } from "react"
import { GroupMemberCard } from "../../grupper/components/GroupMemberCard"
import { useFullPathname } from "src/utils/use-full-pathname"

interface Props {
  members: GroupMember[]
  currentUserId?: UserId
  isMember: boolean
  canLeave: boolean
  onToggleMembership: () => void
}

const getItemCollapseClass = (index: number) => {
  switch (index) {
    case 0:
      return ""
    case 1:
      return "max-sm:hidden"
    case 2:
      return "max-md:hidden"
    case 3:
      return "max-lg:hidden"
    default:
      return "hidden"
  }
}

const getButtonBreakpointClass = (count: number) => {
  switch (count) {
    case 2:
      return "sm:hidden"
    case 3:
      return "md:hidden"
    case 4:
      return "lg:hidden"
    default:
      return ""
  }
}

export const InterestGroupMembers = ({ members, currentUserId, isMember, canLeave, onToggleMembership }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const fullPathname = useFullPathname()
  const authorizeUrl = createAuthorizeUrl({ returnTo: fullPathname })

  const showMembershipToggleButton = !isMember || canLeave
  const isLoggedIn = currentUserId !== undefined

  return (
    <section className="flex flex-col gap-3 border-b border-gray-200 pb-6 dark:border-stone-700">
      <div className="flex items-center justify-between">
        <Title element="h2" className="text-lg flex items-center gap-1">
          Medlemmer <span className="text-gray-500 dark:text-stone-400">({members.length})</span>
        </Title>

        {!isLoggedIn ? (
          <Button
            variant="default"
            element="a"
            href={authorizeUrl}
            icon={<IconUserPlus className="size-4" />}
            className="w-fit"
          >
            Logg inn for å bli medlem
          </Button>
        ) : (
          showMembershipToggleButton && (
            <Button
              variant={isMember ? "outline" : "default"}
              onClick={onToggleMembership}
              icon={isMember ? <IconUserMinus className="size-4" /> : <IconUserPlus className="size-4" />}
              className="w-fit"
            >
              {isMember ? "Forlat gruppe" : "Bli medlem"}
            </Button>
          )
        )}
      </div>

      {members.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {members.map((member, index) => (
            <div key={member.id} className={!isExpanded ? getItemCollapseClass(index) : undefined}>
              <GroupMemberCard member={member} currentUserId={currentUserId} />
            </div>
          ))}
        </div>
      )}

      {members.length > 1 ? (
        <Button
          variant="ghost"
          className={cn(
            "w-fit text-sm font-medium text-muted-foreground hover:text-foreground",
            getButtonBreakpointClass(members.length)
          )}
          onClick={() => setIsExpanded((prev) => !prev)}
          icon={isExpanded ? <IconChevronUp className="size-4" /> : <IconChevronDown className="size-4" />}
        >
          {isExpanded ? "Vis færre" : `Vis alle ${members.length} medlemmer`}
        </Button>
      ) : (
        members.length === 0 && <Text className="text-sm text-muted-foreground">Ingen medlemmer ennå</Text>
      )}
    </section>
  )
}
