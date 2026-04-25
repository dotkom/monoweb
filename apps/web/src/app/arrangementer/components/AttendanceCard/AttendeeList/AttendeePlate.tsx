import { type Attendee, FlagName, MembershipTypeSchema, type User } from "@dotkomonline/types"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  cn,
  Text,
  Title,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dotkomonline/ui"
import { IconRosetteDiscountCheckFilled, IconUser } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link.js"
import type { FC, JSX, PropsWithChildren, ReactNode } from "react"

const getAttendeeIcons = (attendee: Attendee) => {
  const smallIcons: JSX.Element[] = []
  let largeIcon: JSX.Element | null = null

  const exceptionallyDistinguishedFlag = attendee.user.flags.find(
    ({ name }) => name === FlagName.EXCEPTIONALLY_DISTINGUISHED
  )

  if (exceptionallyDistinguishedFlag !== undefined) {
    const isLarge = largeIcon === null

    const icon = (
      <Tooltip key={FlagName.EXCEPTIONALLY_DISTINGUISHED} delayDuration={100}>
        <TooltipTrigger
          className={cn(
            "relative h-fit rounded-full bg-[#fffbf2] shadow-[0_0_12px_rgba(245,183,66,.65)]",
            isLarge ? "p-1" : "p-0.5 -my-1"
          )}
        >
          {isLarge ? (
            <div
              className={cn(
                "size-9 rounded-full overflow-hidden shrink-0 shimmer",
                "shadow-[0_0_0_2px_rgba(201,168,76,0.85),0_0_14px_rgba(201,168,76,0.5)]"
              )}
            >
              {exceptionallyDistinguishedFlag.imageUrl ? (
                <Image
                  src={exceptionallyDistinguishedFlag.imageUrl}
                  alt="Særskilt utmerket"
                  width={36}
                  height={36}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full bg-accent flex items-center justify-center text-brand text-[10px] font-bold">
                  SU
                </div>
              )}
            </div>
          ) : (
            <Avatar className="size-5 ring-1 ring-accent ring-offset-1 shimmer shadow-[0_0_10px_rgba(245,183,66,.25)]">
              <AvatarImage src={exceptionallyDistinguishedFlag.imageUrl ?? undefined} />
              <AvatarFallback>
                <Text
                  element="div"
                  className="h-full w-full bg-accent text-[9px] font-semibold text-brand flex items-center justify-center"
                >
                  SU
                </Text>
              </AvatarFallback>
            </Avatar>
          )}
        </TooltipTrigger>

        <TooltipContent className="flex flex-col gap-2 max-w-xs z-100">
          <Title element="p" className="">
            Særskilt utmerket
          </Title>
          {exceptionallyDistinguishedFlag.imageUrl && (
            <div className="w-full mt-4 flex items-center justify-center">
              <Image
                src={exceptionallyDistinguishedFlag.imageUrl}
                alt={exceptionallyDistinguishedFlag.name}
                width={200}
                height={200}
                className="rounded-full shimmer"
              />
            </div>
          )}
          {exceptionallyDistinguishedFlag.description && (
            <Text className="text-xs text-gray-500 dark:text-stone-500">
              {exceptionallyDistinguishedFlag.description}
            </Text>
          )}
        </TooltipContent>
      </Tooltip>
    )

    if (isLarge) {
      largeIcon = icon
    } else {
      smallIcons.push(icon)
    }
  }

  if (attendee.user.flags.some(({ name }) => name === FlagName.VANITY_VERIFIED)) {
    smallIcons.push(
      <Tooltip key={FlagName.VANITY_VERIFIED} delayDuration={100}>
        <TooltipTrigger>
          <IconRosetteDiscountCheckFilled className="size-[1.25em] text-blue-600 dark:text-sky-700" />
        </TooltipTrigger>
        <TooltipContent>
          <Text>OW Verified</Text>
        </TooltipContent>
      </Tooltip>
    )
  }

  return { largeIcon, smallIcons }
}

export const getAttendeePlate = (attendee: Attendee): FC<PlateProps> => {
  if (attendee.user.flags.some(({ name }) => name === FlagName.EXCEPTIONALLY_DISTINGUISHED)) {
    return ExceptionallyDistinguishedPlate
  }

  if (attendee.user.flags.some(({ name }) => name === FlagName.VANITY_VERIFIED)) {
    return VanityVerifiedPlate
  }

  return GenericPlate
}

interface PlateProps {
  attendee: Attendee
  user: User
  userSection?: ReactNode
  rightSection?: ReactNode
}

type GenericUserSectionProps = PropsWithChildren<{
  attendee: Attendee
  nameClassName?: string
  gradeClassName?: string
}>

const GenericUserSection = ({ attendee, nameClassName, gradeClassName, children }: GenericUserSectionProps) => {
  let gradeString = attendee.userGrade ? `${attendee.userGrade}. klasse` : null

  if (attendee.user.memberships.some(({ type }) => type === MembershipTypeSchema.enum.KNIGHT)) {
    gradeString ??= "Ridder av det Indre Lager"
  }

  gradeString ??= "Ingen klasse"

  return (
    <div className="flex flex-col gap-0.5 grow min-w-0">
      <div className="flex items-center gap-2">
        <Text className={cn("text-sm truncate", nameClassName)} title={attendee.user.name ?? undefined}>
          {attendee.user.name}
        </Text>

        {children}
      </div>
      <Text className={cn("text-xs truncate", gradeClassName)}>{gradeString}</Text>
    </div>
  )
}

const GenericPlate = ({ attendee, user, userSection: customUserSection, rightSection }: PlateProps) => {
  const { largeIcon, smallIcons } = getAttendeeIcons(attendee)
  const isUser = attendee.userId === user.id

  return (
    <Link
      href={`/profil/${attendee.user.username}`}
      className={cn(
        "flex flex-1 min-w-0 items-center gap-4 px-2 py-1.5 rounded-lg w-full overflow-x-hidden transition-colors",
        !isUser && "hover:bg-gray-100 dark:hover:bg-stone-800",
        isUser && "bg-blue-100 hover:bg-blue-200 dark:bg-sky-950 dark:hover:bg-sky-900"
      )}
    >
      <Avatar className={cn("size-10", isUser && "outline-2 -outline-offset-1 outline-blue-500 dark:outline-sky-800")}>
        <AvatarImage src={attendee.user.imageUrl ?? undefined} />
        <AvatarFallback className="bg-gray-300 dark:bg-stone-700">
          <IconUser className="size-5 text-gray-400 dark:text-stone-500" />
        </AvatarFallback>
      </Avatar>

      {customUserSection || (
        <GenericUserSection
          attendee={attendee}
          gradeClassName={cn(!isUser && "text-gray-900 dark:text-stone-300", isUser && "text-black dark:text-white")}
        >
          {smallIcons}
        </GenericUserSection>
      )}

      {rightSection ||
        (largeIcon && <div className="ml-auto flex items-center justify-center">{rightSection || largeIcon}</div>)}
    </Link>
  )
}

export { GenericPlate as AttendeePlate }

const VanityVerifiedPlate = ({ attendee, rightSection }: PlateProps) => {
  const { largeIcon, smallIcons } = getAttendeeIcons(attendee)

  return (
    <Link
      href={`/profil/${attendee.user.username}`}
      className={cn(
        "flex flex-1 min-w-0 items-center gap-4 px-2 py-1.5 rounded-lg w-full overflow-x-hidden transition-colors",
        "bg-linear-to-r",
        "from-yellow-200 via-yellow-100 hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-200",
        "dark:from-yellow-500 dark:via-yellow-600 dark:hover:from-yellow-400 dark:hover:via-yellow-500 dark:hover:to-yellow-800"
      )}
    >
      <Avatar className="size-10 outline-2 -outline-offset-1 outline-yellow-500 dark:outline-yellow-600">
        <AvatarImage src={attendee.user.imageUrl ?? undefined} />
        <AvatarFallback className="bg-yellow-400 dark:bg-yellow-700">
          <IconUser className="size-[1.25em]" />
        </AvatarFallback>
      </Avatar>

      <GenericUserSection attendee={attendee} nameClassName="dark:text-black" gradeClassName="dark:text-black">
        {smallIcons}
      </GenericUserSection>

      {rightSection ||
        (largeIcon && <div className="ml-auto flex items-center justify-center">{rightSection || largeIcon}</div>)}
    </Link>
  )
}

const ExceptionallyDistinguishedPlate = ({ attendee, rightSection }: PlateProps) => {
  const { largeIcon, smallIcons } = getAttendeeIcons(attendee)

  return (
    <Link
      href={`/profil/${attendee.user.username}`}
      className={cn(
        "group relative flex w-full items-stretch rounded-lg p-0.5",
        "transition-all duration-300",
        "bg-accent",
        "shadow-[0_0_14px_rgba(201,168,76,0.25)] hover:shadow-[0_0_26px_rgba(201,168,76,0.50)]"
      )}
    >
      <div
        className={cn(
          // Inner teal card — no overflow-hidden so tooltip portals aren't clipped
          "relative flex flex-1 min-w-0 items-center gap-4 px-2 py-1.5 rounded-[6px] w-full",
          "bg-origin-border",
          "bg-[linear-gradient(rgb(12_74_97),rgb(12_74_97)),linear-gradient(to_right,#c8a03c_0%,#dbb84a_35%,#f0cc58_68%,#f8de76_100%)]",
          "[background-clip:padding-box,border-box]",
          "dark:bg-[linear-gradient(rgb(8_46_63),rgb(8_46_63)),linear-gradient(to_right,#8c6a28_0%,#aa8234_35%,#c29844_68%,#d4aa50_100%)]"
        )}
      >
        {/* Exceptionally distinguished leaf — own overflow-hidden so it doesn't clip tooltip portals */}
        <div className="pointer-events-none absolute inset-0 rounded-[6px] overflow-hidden">
          <div className="absolute inset-0 left-1/3 flex items-center justify-center opacity-[0.13] transition-opacity duration-300 group-hover:opacity-25">
            <div className="w-1/5 rotate-270">
              <ExceptionallyDistinguishedLeaf className="fill-black" />
            </div>
          </div>
        </div>

        <Avatar className={cn("relative size-10 shrink-0", "shadow-[0_0_0_2px_rgba(0,0,0,.25)]")}>
          <AvatarImage src={attendee.user.imageUrl ?? undefined} />
          <AvatarFallback className="bg-brand text-white">
            <IconUser className="size-[1.25em]" />
          </AvatarFallback>
        </Avatar>

        <GenericUserSection attendee={attendee} nameClassName="text-orange-200 font-medium" gradeClassName="text-white">
          {smallIcons}
        </GenericUserSection>

        {rightSection ||
          (largeIcon && <div className="ml-auto flex items-center justify-center pr-0.5">{largeIcon}</div>)}
      </div>
    </Link>
  )
}
