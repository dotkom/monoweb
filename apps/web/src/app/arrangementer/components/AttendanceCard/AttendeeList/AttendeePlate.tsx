import { type Attendee, isVanityVerified, type User } from "@dotkomonline/types"
import type { FC, JSX, ReactNode } from "react"
import { GenericPlate } from "./GenericPlate"
import { getVanityVerifiedSmallIcon, VanityVerifiedPlate } from "./VanityVerifiedPlate"

export interface PlateProps {
  attendee: Attendee
  user: User
  smallIcons: JSX.Element[]
  largeIcon: JSX.Element | null
  userSection?: ReactNode
  rightSection?: ReactNode
}

export function getAttendeePlate(attendee: Attendee): FC<PlateProps> {
  if (isVanityVerified(attendee.user)) {
    return VanityVerifiedPlate
  }

  return GenericPlate
}

export function getAttendeeIcons(attendee: Attendee) {
  const smallIcons: JSX.Element[] = []
  const largeIcon: JSX.Element | null = null

  if (isVanityVerified(attendee.user)) {
    smallIcons.push(getVanityVerifiedSmallIcon())
  }

  return { largeIcon, smallIcons }
}
