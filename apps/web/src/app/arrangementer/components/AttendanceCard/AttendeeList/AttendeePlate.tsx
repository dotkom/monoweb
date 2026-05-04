import type { FC, JSX } from "react"
import { GenericPlate } from "./GenericPlate"
import { getVanityVerifiedSmallIcon, VanityVerifiedPlate } from "./VanityVerifiedPlate"
import type { Attendee } from "@dotkomonline/rpc/attendance"
import { FlagNameSchema, isVanityVerified } from "@dotkomonline/rpc/user"
import type { PlateProps } from "./Plate"

export type { PlateProps }

export function getAttendeePlate(attendee: Attendee): FC<PlateProps> {
  if (isVanityVerified(attendee.user)) {
    return VanityVerifiedPlate
  }

  return GenericPlate
}

export function getAttendeeIcons(attendee: Attendee) {
  const smallIcons: JSX.Element[] = []
  const largeIcon: JSX.Element | null = null

  const vanityVerifiedFlag = attendee.user.flags.find(({ name }) => name === FlagNameSchema.enum.VANITY_VERIFIED)

  if (vanityVerifiedFlag !== undefined) {
    smallIcons.push(
      getVanityVerifiedSmallIcon({
        flag: vanityVerifiedFlag,
        withWhiteBackground: false,
      })
    )
  }

  return { largeIcon, smallIcons }
}
