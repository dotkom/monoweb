import { isKnight, type Attendee } from "@dotkomonline/types"
import { Avatar, AvatarFallback, AvatarImage, cn, Text } from "@dotkomonline/ui"
import { IconUser } from "@tabler/icons-react"
import Link from "next/link.js"
import type { PropsWithChildren } from "react"
import { getAttendeeIcons, type PlateProps } from "./AttendeePlate"

export function GenericPlate({ attendee, user, userSection: customUserSection, rightSection }: PlateProps) {
  const { largeIcon, smallIcons } = getAttendeeIcons(attendee)
  const isUser = attendee.userId === user.id
  const resolvedRightSection = rightSection ?? largeIcon

  return (
    <Link
      href={`/profil/${attendee.user.username}`}
      className={cn(
        "flex flex-1 min-w-0 items-center gap-4 px-2 py-1.5 rounded-lg w-full overflow-x-hidden transition-colors",
        !isUser && "hover:bg-gray-100 dark:hover:bg-stone-700",
        isUser && "bg-blue-100 hover:bg-blue-200 dark:bg-sky-950 dark:hover:bg-sky-900"
      )}
    >
      <Avatar
        className={cn(
          "size-10 shrink-0",
          isUser && "outline-2 -outline-offset-1 outline-blue-500 dark:outline-sky-800"
        )}
      >
        <AvatarImage src={attendee.user.imageUrl ?? undefined} />
        <AvatarFallback className="bg-gray-300 dark:bg-stone-700">
          <IconUser className="size-[1.25em]" />
        </AvatarFallback>
      </Avatar>

      {customUserSection || (
        <GenericPlateUserSection
          attendee={attendee}
          gradeClassName={cn(!isUser && "text-gray-900 dark:text-stone-300", isUser && "text-black dark:text-white")}
        >
          {smallIcons}
        </GenericPlateUserSection>
      )}

      <div className="min-w-4 flex-1" />

      {resolvedRightSection && <div className="flex shrink-0 items-center justify-center">{resolvedRightSection}</div>}
    </Link>
  )
}

type GenericPlateUserSectionProps = PropsWithChildren<{
  attendee: Attendee
  nameClassName?: string
  gradeClassName?: string
}>

export function GenericPlateUserSection({
  attendee,
  nameClassName,
  gradeClassName,
  children,
}: GenericPlateUserSectionProps) {
  const gradeString = attendee.userGrade !== null ? `${attendee.userGrade}. klasse` : null
  const knightString = isKnight(attendee.user) ? "Ridder av det Indre Lager" : null

  return (
    <div className="flex w-fit max-w-full min-w-0 shrink flex-col gap-0.5">
      <div className="flex min-w-0 items-center gap-2">
        <Text className={cn("min-w-0 truncate text-sm", nameClassName)} title={attendee.user.name ?? undefined}>
          {attendee.user.name}
        </Text>

        {children}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        {gradeString !== null && <Text className={cn("min-w-0 truncate text-xs", gradeClassName)}>{gradeString}</Text>}

        {gradeString !== null && knightString !== null && <Text className={cn("text-xs", gradeClassName)}>•</Text>}

        {knightString !== null && (
          <Text className={cn("min-w-0 truncate text-xs", gradeClassName)}>{knightString}</Text>
        )}
      </div>
    </div>
  )
}
