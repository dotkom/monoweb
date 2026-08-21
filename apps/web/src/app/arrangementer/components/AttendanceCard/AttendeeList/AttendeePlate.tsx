import type { FC, JSX } from "react"
import { GenericPlate } from "./GenericPlate"
import { getVanityVerifiedSmallIcon, VanityVerifiedPlate } from "./VanityVerifiedPlate"
import type { Attendee } from "@dotkomonline/rpc/attendance"
import type { PlateProps } from "./Plate"
import { FlagName, isExceptionallyDistinguished, isVanityVerified } from "@dotkomonline/rpc/user"
import {
  ExceptionallyDistinguishedPlate,
  getExceptionallyDistinguishedLargeIcon,
  getExceptionallyDistinguishedSmallIcon,
} from "./ExceptionallyDistinguished"

export type { PlateProps }

export function getAttendeePlate(attendee: Attendee): FC<PlateProps> {
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
