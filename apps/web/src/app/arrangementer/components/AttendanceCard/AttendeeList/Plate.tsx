"use client"

import { Avatar, AvatarFallback, AvatarImage, cn, Text } from "@dotkomonline/ui"
import { IconUser } from "@tabler/icons-react"
import type { Attendee } from "@dotkomonline/rpc/attendance"
import { isKnight, type User } from "@dotkomonline/rpc/user"
import Link from "next/link.js"
import { createContext, useContext, type JSX, type ReactNode } from "react"
import {
  formatExceptionallyDistinguishedCreatedAtYear,
  getExceptionallyDistinguishedFlag,
} from "./exceptionallyDistinguished"

export interface PlateProps {
  attendee: Attendee
  user: User
  smallIcons: JSX.Element[]
  largeIcon: JSX.Element | null
}

interface PlateContextValue {
  attendee: Attendee
  user: User
  smallIcons: JSX.Element[]
  largeIcon: JSX.Element | null
}

const PlateContext = createContext<PlateContextValue | null>(null)

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

function PlateRoot({ attendee, user, smallIcons, largeIcon, className, children }: PlateRootProps) {
  const contextValue: PlateContextValue = { attendee, user, smallIcons, largeIcon }
  const profileHref = `/profil/${attendee.user.username}`
  const profileLabel = attendee.user.name ?? attendee.user.username

  return (
    <PlateContext.Provider value={contextValue}>
      <div className={cn("relative flex min-w-0 w-full flex-1 items-center", className)}>
        <Link href={profileHref} className="absolute inset-0 z-0" aria-label={profileLabel} />
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
  const { attendee } = usePlateContext()

  return (
    <Avatar className={cn("size-10 shrink-0", className)}>
      <AvatarImage src={attendee.user.imageUrl ?? undefined} />
      <AvatarFallback className={fallbackClassName}>
        <IconUser className="size-[1.25em]" />
      </AvatarFallback>
    </Avatar>
  )
}

interface AttendeeDetailsProps {
  nameClassName?: string
  gradeClassName?: string
}

function AttendeeDetails({ nameClassName, gradeClassName }: AttendeeDetailsProps) {
  const { attendee, smallIcons } = usePlateContext()

  const hasGrade = attendee.userGrade !== null

  const knight = isKnight(attendee.user)

  const exceptionallyDistinguishedFlag = getExceptionallyDistinguishedFlag(attendee.user.flags)
  const exceptionallyDistinguished = exceptionallyDistinguishedFlag !== null

  let exceptionallyDistinguishedText = "Særskilt utmerket"

  if (exceptionallyDistinguishedFlag !== null) {
    const createdAtYear = formatExceptionallyDistinguishedCreatedAtYear(exceptionallyDistinguishedFlag)

    exceptionallyDistinguishedText = `${exceptionallyDistinguishedText} ${createdAtYear}`
  }

  return (
    <div className="flex w-fit max-w-full min-w-0 shrink flex-col gap-0.5">
      <div className="flex min-w-0 items-center gap-2">
        <Text className={cn("min-w-0 truncate text-sm", nameClassName)} title={attendee.user.name ?? undefined}>
          {attendee.user.name}
        </Text>

        {smallIcons.length > 0 && <span className="pointer-events-auto flex items-center gap-2">{smallIcons}</span>}
      </div>

      <div className="flex min-w-0 items-center gap-2">
        {hasGrade && (
          <Text className={cn("min-w-0 truncate text-xs", gradeClassName)}>{attendee.userGrade}. klasse</Text>
        )}

        {hasGrade && exceptionallyDistinguished && <Text className={cn("text-xs", gradeClassName)}>•</Text>}

        {knight && (
          <>
            <Text className={cn("min-w-0 truncate text-xs max-sm:hidden", gradeClassName)}>
              Ridder av det Indre Lager
            </Text>
            <Text className={cn("min-w-0 truncate text-xs sm:hidden", gradeClassName)}>Ridder</Text>
          </>
        )}

        {exceptionallyDistinguished && !knight && (
          <Text className={cn("min-w-0 truncate text-xs", gradeClassName)}>{exceptionallyDistinguishedText}</Text>
        )}
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
