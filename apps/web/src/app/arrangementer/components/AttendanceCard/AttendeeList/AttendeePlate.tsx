import type { FC, JSX } from "react"
import { GenericPlate } from "./GenericPlate"
import { getVanityVerifiedSmallIcon, VanityVerifiedPlate } from "./VanityVerifiedPlate"
import type { Attendee } from "@dotkomonline/rpc/attendance"
import { FlagNameSchema, isVanityVerified, isExceptionallyDistinguished, isKnight } from "@dotkomonline/rpc/user"
import type { PlateProps } from "./Plate"
import {
  ExceptionallyDistinguishedPlate,
  getExceptionallyDistinguishedLargeIcon,
  getExceptionallyDistinguishedSmallIcon,
} from "./ExceptionallyDistinguishedPlate"
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

  const exceptionallyDistinguishedFlags = attendee.user.flags.filter(
    ({ name }) => name === FlagNameSchema.enum.EXCEPTIONALLY_DISTINGUISHED
  )

  if (exceptionallyDistinguishedFlags.length > 0) {
    if (largeIcon === null) {
      largeIcon = getExceptionallyDistinguishedLargeIcon(exceptionallyDistinguishedFlags)
    } else {
      smallIcons.push(getExceptionallyDistinguishedSmallIcon(exceptionallyDistinguishedFlags))
    }
  }

  const vanityVerifiedFlag = attendee.user.flags.find(({ name }) => name === FlagNameSchema.enum.VANITY_VERIFIED)

  if (vanityVerifiedFlag !== undefined) {
    const withWhiteBackground = isKnight(attendee.user) || isExceptionallyDistinguished(attendee.user)

    smallIcons.push(
      getVanityVerifiedSmallIcon({
        flag: vanityVerifiedFlag,
        withWhiteBackground,
      })
    )
  }

  return { largeIcon, smallIcons }
}
