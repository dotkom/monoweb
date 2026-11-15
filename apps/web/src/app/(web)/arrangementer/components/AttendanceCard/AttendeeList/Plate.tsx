"use client"

import { Avatar, AvatarFallback, AvatarImage, cn, Text } from "@dotkomonline/ui"
import { IconUser } from "@tabler/icons-react"
import type { AttendeeSummary } from "@dotkomonline/rpc/attendance"
import { isKnight } from "@dotkomonline/rpc/user"
import { createUserProfileUrl } from "@dotkomonline/utils"
import Link from "next/link.js"
import { createContext, useContext, type JSX, type ReactNode } from "react"
import {
  formatExceptionallyDistinguishedCreatedAtYear,
  getExceptionallyDistinguishedFlag,
} from "./exceptionallyDistinguished"

export interface PlateProps {
  attendee: Pick<AttendeeSummary, "userGrade" | "userId">
  user: AttendeeSummary["user"]
  smallIcons: JSX.Element[]
  largeIcon: JSX.Element | null
  isCurrentUser: boolean
}

const PlateContext = createContext<PlateProps | null>(null)

function usePlateContext() {
  const context = useContext(PlateContext)

  if (context === null) {
    throw new Error("Plate compound parts must be used within Plate")
  }

  return context
}

interface PlateRootProps extends PlateProps {
  className?: string
  children: ReactNode
}

function PlateRoot({ attendee, user, smallIcons, largeIcon, isCurrentUser, className, children }: PlateRootProps) {
  const contextValue: PlateProps = { attendee, user, smallIcons, largeIcon, isCurrentUser }
  const profileHref = createUserProfileUrl(user.username)
  const profileLabel = user.name ?? user.username

  return (
    <PlateContext.Provider value={contextValue}>
      <div className={cn("relative flex min-w-0 w-full flex-1 items-center", className)}>
        <Link href={profileHref} className="absolute inset-0 z-0" aria-label={profileLabel} prefetch={false} />
        {children}
      </div>
    </PlateContext.Provider>
  )
}

interface IdentityAreaProps {
  className?: string
  children: ReactNode
}

function IdentityArea({ className, children }: IdentityAreaProps) {
  return (
    <div className={cn("pointer-events-none relative z-10 flex min-w-0 items-center gap-4", className)}>{children}</div>
  )
}

interface PlateAvatarProps {
  className?: string
  fallbackClassName?: string
}

function PlateAvatar({ className, fallbackClassName }: PlateAvatarProps) {
  const { user } = usePlateContext()

  return (
    <Avatar className={cn("size-10 shrink-0 after:hidden", className)}>
      <AvatarImage src={user.imageUrl ?? undefined} />
      <AvatarFallback className={fallbackClassName}>
        <IconUser className="size-[1.25em]" />
      </AvatarFallback>
    </Avatar>
  )
}

interface AttendeeDetailsProps {
  className?: string
  nameClassName?: string
  subtitleClassName?: string
}

function getSubtitleItem(user: PlateProps["user"], subtitleClassName?: string) {
  if (isKnight(user)) {
    return (
      <div className="@container/knight-title min-w-0 flex-1">
        <Text className={cn("hidden truncate text-xs @min-[9.5rem]/knight-title:block", subtitleClassName)}>
          Ridder av Det Indre Lager
        </Text>
        <Text className={cn("truncate text-xs @min-[9.5rem]/knight-title:hidden", subtitleClassName)}>Ridder</Text>
      </div>
    )
  }

  const exceptionallyDistinguishedFlag = getExceptionallyDistinguishedFlag(user.flags)

  if (exceptionallyDistinguishedFlag === null) {
    return null
  }

  const awardedAtYear = formatExceptionallyDistinguishedCreatedAtYear(exceptionallyDistinguishedFlag)

  return <Text className={cn("min-w-0 truncate text-xs", subtitleClassName)}>Særskilt utmerket {awardedAtYear}</Text>
}

function AttendeeDetails({ className, nameClassName, subtitleClassName }: AttendeeDetailsProps) {
  const { attendee, user, smallIcons } = usePlateContext()

  const hasGrade = attendee.userGrade !== null
  const subtitleItem = getSubtitleItem(user, subtitleClassName)

  return (
    <div className={cn("flex w-fit max-w-full min-w-0 shrink flex-col gap-0.5", className)}>
      <div className="flex min-w-0 items-center gap-2">
        <Text className={cn("min-w-0 truncate text-sm", nameClassName)} title={user.name ?? undefined}>
          {user.name}
        </Text>

        {smallIcons.length > 0 && (
          <span className="pointer-events-auto flex shrink-0 items-center gap-2">{smallIcons}</span>
        )}
      </div>

      <div className="flex min-w-0 items-center gap-2">
        {hasGrade && <Text className={cn("shrink-0 text-xs", subtitleClassName)}>{attendee.userGrade}. klasse</Text>}

        {hasGrade && subtitleItem !== null && <Text className={cn("shrink-0 text-xs", subtitleClassName)}>•</Text>}

        {subtitleItem}
      </div>
    </div>
  )
}

interface AccessoryAreaProps {
  className?: string
  children: ReactNode
}

function AccessoryArea({ className, children }: AccessoryAreaProps) {
  return (
    <div className={cn("pointer-events-none relative z-10 flex min-w-fit flex-1 items-center justify-end", className)}>
      {children}
    </div>
  )
}

interface PlateBigIconProps {
  className?: string
}

function PlateBigIcon({ className }: PlateBigIconProps) {
  const { largeIcon } = usePlateContext()

  if (largeIcon === null) {
    return null
  }

  return (
    <div className={cn("pointer-events-auto relative z-20 flex shrink-0 items-center justify-center", className)}>
      {largeIcon}
    </div>
  )
}

export const Plate = Object.assign(PlateRoot, {
  IdentityArea,
  Avatar: PlateAvatar,
  AttendeeDetails,
  AccessoryArea,
  BigIcon: PlateBigIcon,
})
