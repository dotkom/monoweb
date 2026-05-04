import type { FC, JSX } from "react"
import { GenericPlate } from "./GenericPlate"
import { getVanityVerifiedSmallIcon, VanityVerifiedPlate } from "./VanityVerifiedPlate"
import type { Attendee } from "@dotkomonline/rpc/attendance"
import { FlagNameSchema, isVanityVerified, isExceptionallyDistinguished } from "@dotkomonline/rpc/user"
import type { PlateProps } from "./Plate"
import {
  ExceptionallyDistinguishedPlate,
  getExceptionallyDistinguishedLargeIcon,
  getExceptionallyDistinguishedSmallIcon,
} from "./ExceptionallyDistinguishedPlate"

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
    const withWhiteBackground = isExceptionallyDistinguished(attendee.user)

    smallIcons.push(
      getVanityVerifiedSmallIcon({
        flag: vanityVerifiedFlag,
        withWhiteBackground,
      })
    )
  }

  return { largeIcon, smallIcons }
}
