"use client"

import {
  type Membership,
  type User,
  findActiveMembership,
  getGenderName,
  getMembershipTypeName,
} from "@dotkomonline/rpc/user"
import { getStudyGrade } from "@dotkomonline/utils"
import { Avatar, AvatarFallback, AvatarImage, Text, Title } from "@dotkomonline/ui"
import { IconAlertTriangle, IconUser } from "@tabler/icons-react"

interface UserBoxProps {
  user: User
  isMobile: boolean
}

export function UserBox({ user, isMobile }: UserBoxProps) {
  const membership = findActiveMembership(user)

  return (
    <div className="flex flex-col gap-2">
      <div className={`flex gap-4 rounded-md bg-muted/50 p-2 ${isMobile ? "flex-col" : "flex-row"} items-start`}>
        <Avatar className="size-25 rounded-sm">
          {user.imageUrl && <AvatarImage src={user.imageUrl} alt={user.name ?? user.username} />}
          <AvatarFallback>
            <IconUser className="size-12" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-0.5">
          <Title className="text-lg">{user.name}</Title>

          {membership === null ? (
            <div className="flex items-center gap-1.5">
              <IconAlertTriangle className="size-4 text-red-600" />
              <Text className="text-sm text-red-600">Har ikke aktivt medlemskap</Text>
            </div>
          ) : (
            <Text className="text-sm">{getMembershipDisplayText(membership)}</Text>
          )}

          <Text className="text-sm">Kjønn: {getGenderName(user.gender)}</Text>
          <Text className="text-sm">Kostholdsrestriksjoner: {user.dietaryRestrictions || "Ingen"}</Text>
        </div>
      </div>
    </div>
  )
}

function getMembershipDisplayText(membership: Membership): string {
  const membershipType = getMembershipTypeName(membership.type)
  const grade = membership.semester != null ? getStudyGrade(membership.semester) : null

  if (grade === null) {
    return membershipType
  }

  return `${grade}. klasse (${membershipType})`
}
