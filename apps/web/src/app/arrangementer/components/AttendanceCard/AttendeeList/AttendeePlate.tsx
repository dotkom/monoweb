import { type Attendee, FlagName, type User } from "@dotkomonline/types"
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

  const exceptionallyDistinguished = attendee.user.flags.find(
    ({ name }) => name === FlagName.EXCEPTIONALLY_DISTINGUISHED
  )
  if (exceptionallyDistinguished !== undefined) {
    // const isLarge = largeIcon === null
    const isLarge = false

    const icon = (
      <Tooltip key={FlagName.EXCEPTIONALLY_DISTINGUISHED} delayDuration={100}>
        <TooltipTrigger className="relative h-fit bg-white rounded-full -m-1 p-0.5">
          <Avatar className={cn("shimmer", isLarge ? "size-9" : "size-5")}>
            <AvatarImage src={exceptionallyDistinguished.imageUrl ?? undefined} />
            <AvatarFallback>
              <Text
                element="div"
                className="h-full w-full bg-accent text-[9px] font-semibold text-black flex items-center justify-center"
              >
                SU
              </Text>
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>

        <TooltipContent className="flex flex-col gap-2">
          <Title element="p" className="">
            Særskilt utmerket
          </Title>
          {exceptionallyDistinguished.imageUrl && (
            <div className="w-full mt-4">
              <div className="relative mx-auto rounded-full w-fit">
                <div className="absolute inset-0 rounded-full size-52 bg-accent/40 blur-lg animate-pulse" />
                <div className="relative p-2 bg-white rounded-full">
                  <Image
                    src={exceptionallyDistinguished.imageUrl}
                    alt={exceptionallyDistinguished.name}
                    width={200}
                    height={200}
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>
          )}
          {exceptionallyDistinguished.description && (
            <Text className="text-xs text-gray-500 dark:text-stone-500">{exceptionallyDistinguished.description}</Text>
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

const GenericUserSection = ({ attendee, nameClassName, gradeClassName, children }: GenericUserSectionProps) => (
  <div className="flex flex-col gap-0.5 grow min-w-0">
    <div className="flex items-center gap-2">
      <Text className={cn("text-sm truncate", nameClassName)} title={attendee.user.name ?? undefined}>
        {attendee.user.name}
      </Text>

      {children}
    </div>
    <Text className={cn("text-xs truncate", gradeClassName)}>
      {attendee.userGrade ? `${attendee.userGrade}. klasse` : "Ingen klasse"}
    </Text>
  </div>
)

const GenericPlate = ({ attendee, user, userSection: customUserSection, rightSection }: PlateProps) => {
  const { largeIcon, smallIcons } = getAttendeeIcons(attendee)
  const isUser = attendee.userId === user.id

  return (
    <Link
      href={`/profil/${attendee.user.username}`}
      className={cn(
        "flex flex-1 min-w-0 items-center gap-4 p-1.5 rounded-lg w-full overflow-x-hidden transition-colors",
        !isUser && "hover:bg-gray-100 dark:hover:bg-stone-700",
        isUser && "bg-blue-100 hover:bg-blue-200 dark:bg-sky-950 dark:hover:bg-sky-900"
      )}
    >
      <Avatar className={cn("size-10", isUser && "outline-2 outline-blue-500 dark:outline-sky-800")}>
        <AvatarImage src={attendee.user.imageUrl ?? undefined} />
        <AvatarFallback className="bg-gray-500 dark:bg-stone-500">
          <IconUser className="size-[1.25em]" />
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
        "flex flex-1 min-w-0 items-center gap-4 p-1.5 rounded-lg w-full overflow-x-hidden transition-colors",
        "bg-linear-to-r",
        "from-yellow-200 via-yellow-100 hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-200",
        "dark:from-yellow-500 dark:via-yellow-600 dark:hover:from-yellow-400 dark:hover:via-yellow-500 dark:hover:to-yellow-800"
      )}
    >
      <Avatar className="size-10 outline-2 outline-yellow-500 dark:outline-yellow-600">
        <AvatarImage src={attendee.user.imageUrl ?? undefined} />
        <AvatarFallback className="bg-yellow-500 dark:bg-yellow-700">
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
