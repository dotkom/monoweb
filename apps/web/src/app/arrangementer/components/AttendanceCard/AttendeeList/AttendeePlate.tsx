import type { FC, JSX } from "react"
import { GenericPlate } from "./GenericPlate"
import { getVanityVerifiedSmallIcon, VanityVerifiedPlate } from "./VanityVerifiedPlate"
import type { Attendee } from "@dotkomonline/rpc/attendance"
import type { PlateProps } from "./Plate"
import { FlagName, isExceptionallyDistinguished, isKnight, isVanityVerified } from "@dotkomonline/rpc/user"
import {
  ExceptionallyDistinguishedPlate,
  getExceptionallyDistinguishedLargeIcon,
  getExceptionallyDistinguishedSmallIcon,
} from "./ExceptionallyDistinguished"
import { getKnightLargeIcon, getKnightSmallIcon, KnightPlate } from "./KnightPlate"

export type { PlateProps }

export function getAttendeePlate(attendee: Attendee): FC<PlateProps> {
  if (isKnight(attendee.user)) {
    return KnightPlate
  }

  if (isExceptionallyDistinguished(attendee.user)) {
    return ExceptionallyDistinguishedPlate
  }

  if (isVanityVerified(attendee.user)) {
    return VanityVerifiedPlate
  }

  return GenericPlate
}

export function getAttendeeIcons(attendee: Attendee) {
  const smallIcons: JSX.Element[] = []
  let largeIcon: JSX.Element | null = null

  if (isKnight(attendee.user)) {
    if (largeIcon === null) {
      largeIcon = getKnightLargeIcon()
    } else {
      smallIcons.push(getKnightSmallIcon())
    }
  }

  if (isExceptionallyDistinguished(attendee.user)) {
    const flags = attendee.user.flags.filter(({ name }) => name === FlagName.EXCEPTIONALLY_DISTINGUISHED)

    if (largeIcon === null) {
      largeIcon = getExceptionallyDistinguishedLargeIcon(flags)
    } else {
      smallIcons.push(getExceptionallyDistinguishedSmallIcon(flags))
    }
  }

  if (isVanityVerified(attendee.user)) {
    smallIcons.push(getVanityVerifiedSmallIcon())
  }

  return { largeIcon, smallIcons }
}
