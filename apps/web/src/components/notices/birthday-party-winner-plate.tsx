"use client"

import { getUserIcons, getUserPlate } from "@/app/arrangementer/components/AttendanceCard/AttendeeList/UserPlate"
import { findActiveMembership, type User } from "@dotkomonline/rpc/user"
import { getStudyGrade } from "@dotkomonline/utils"

export function BirthdayPartyWinnerPlate({ user, isCurrentUser }: { user: User; isCurrentUser: boolean }) {
  const UserPlate = getUserPlate(user)
  const { largeIcon, smallIcons } = getUserIcons(user)
  const membership = findActiveMembership(user)
  let userGrade: number | null = null
  if (membership !== null && membership.semester !== null) {
    userGrade = getStudyGrade(membership.semester)
  }

  return (
    <div className="w-fit min-w-72 max-w-full rounded-full bg-white p-1">
      <UserPlate
        attendee={{ userId: user.id, userGrade }}
        user={user}
        smallIcons={smallIcons}
        largeIcon={largeIcon}
        isCurrentUser={isCurrentUser}
      />
    </div>
  )
}
