import type { FC, JSX } from "react"
import { GenericPlate } from "./GenericPlate"
import { getVanityVerifiedSmallIcon, VanityVerifiedPlate } from "./VanityVerifiedPlate"
import { FlagNameSchema, isVanityVerified, isExceptionallyDistinguished, isKnight } from "@dotkomonline/rpc/user"
import type { PlateProps } from "./Plate"
import {
  ExceptionallyDistinguishedPlate,
  getExceptionallyDistinguishedLargeIcon,
  getExceptionallyDistinguishedSmallIcon,
} from "./ExceptionallyDistinguishedPlate"
import { getKnightLargeIcon, getKnightSmallIcon, KnightPlate } from "./KnightPlate"

export type { PlateProps }

export function getAttendeePlate(user: PlateProps["user"]): FC<PlateProps> {
  if (isKnight(user)) {
    return KnightPlate
  }

  if (isExceptionallyDistinguished(user)) {
    return ExceptionallyDistinguishedPlate
  }

  if (isVanityVerified(user)) {
    return VanityVerifiedPlate
  }

  return GenericPlate
}

export function getAttendeeIcons(user: PlateProps["user"]) {
  const smallIcons: JSX.Element[] = []
  let largeIcon: JSX.Element | null = null

  if (isKnight(user)) {
    if (largeIcon === null) {
      largeIcon = getKnightLargeIcon()
    } else {
      smallIcons.push(getKnightSmallIcon())
    }
  }

  const exceptionallyDistinguishedFlags = user.flags.filter(
    ({ name }) => name === FlagNameSchema.enum.EXCEPTIONALLY_DISTINGUISHED
  )

  if (exceptionallyDistinguishedFlags.length > 0) {
    if (largeIcon === null) {
      largeIcon = getExceptionallyDistinguishedLargeIcon(exceptionallyDistinguishedFlags)
    } else {
      smallIcons.push(getExceptionallyDistinguishedSmallIcon(exceptionallyDistinguishedFlags))
    }
  }

  const vanityVerifiedFlag = user.flags.find(({ name }) => name === FlagNameSchema.enum.VANITY_VERIFIED)

  if (vanityVerifiedFlag !== undefined) {
    const withWhiteBackground = isKnight(user) || isExceptionallyDistinguished(user)

    smallIcons.push(
      getVanityVerifiedSmallIcon({
        flag: vanityVerifiedFlag,
        withWhiteBackground,
      })
    )
  }

  return { largeIcon, smallIcons }
}
