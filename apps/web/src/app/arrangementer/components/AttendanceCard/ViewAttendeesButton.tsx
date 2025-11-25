import type { Attendance, Attendee, User } from "@dotkomonline/types"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Text,
  Title,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@dotkomonline/ui"
import { IconRosetteDiscountCheckFilled, IconUser, IconUsers, IconX } from "@tabler/icons-react"
import { compareAsc } from "date-fns"
import Link from "next/link"
import type { ReactNode } from "react"

const getMinWidth = (maxNumberOfAttendees: number) => {
  switch (maxNumberOfAttendees.toString().length) {
    case 1:
      return "min-w-[2ch]"
    case 2:
      return "min-w-[3ch]"
    case 3:
      return "min-w-[4ch]"
    case 4:
      return "min-w-[5ch]"
    default:
      return "min-w-[6ch]"
  }
}

interface ViewAttendeesButtonProps {
  attendeeListOpen: boolean
  setAttendeeListOpen: (open: boolean) => void
  attendance: Attendance
  user: User | null
}

export const ViewAttendeesButton = ({
  attendeeListOpen,
  setAttendeeListOpen,
  attendance,
  user,
}: ViewAttendeesButtonProps) => {
  const allAttendees = attendance.attendees.toSorted((a, b) =>
    compareAsc(a.earliestReservationAt, b.earliestReservationAt)
  )
  const reservedAttendees = allAttendees.filter((attendee) => attendee.reserved)
  const waitlistAttendees = allAttendees.filter((attendee) => !attendee.reserved)

  const maxAttendees = Math.max(reservedAttendees.length, waitlistAttendees.length)

  const button = (
    <Button
      color="light"
      className="rounded-lg w-full h-fit min-h-[4rem] font-medium"
      icon={<IconUsers className="size-[1.25em]" />}
      disabled={!user}
    >
      Vis påmeldte
    </Button>
  )

  if (!user) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent sideOffset={-10}>
          <Text>Du må være innlogget for å se påmeldte</Text>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <AlertDialog open={attendeeListOpen} onOpenChange={setAttendeeListOpen}>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent
        className="flex flex-col gap-4 w-full p-0 bg-white dark:bg-stone-800 drop-shadow-lg sm:max-w-2xl rounded-lg"
        onOutsideClick={() => setAttendeeListOpen(false)}
      >
        <div className="flex items-center justify-between px-4 pt-4 rounded-t-lg">
          <AlertDialogTitle asChild>
            <Title element="h1" size="lg">
              Påmeldingsliste
            </Title>
          </AlertDialogTitle>
          <AlertDialogCancel className="p-2">
            <IconX className="size-[1.25em]" />
          </AlertDialogCancel>
        </div>

        <div className="flex flex-col gap-1 px-4 pb-4 rounded-lg min-h-[25dvh] max-h-[75dvh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <Title className="font-medium text-base px-2 py-1 bg-gray-100 dark:bg-stone-700 rounded-md sticky top-0 z-10">
              Påmeldte
            </Title>

            <AttendeeList attendees={reservedAttendees} maxNumberOfAttendees={maxAttendees} user={user} />
          </div>

          {waitlistAttendees.length > 0 && (
            <div className="flex flex-col gap-2 mt-6">
              <Title className="font-medium text-base px-2 py-1 bg-gray-100 dark:bg-stone-700 rounded-md sticky top-0 z-10">
                Venteliste
              </Title>
              <AttendeeList attendees={waitlistAttendees} maxNumberOfAttendees={maxAttendees} user={user} />
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface AttendeeListProps {
  attendees: Attendee[]
  user: User
  maxNumberOfAttendees: number
}

const AttendeeList = ({ attendees, user, maxNumberOfAttendees }: AttendeeListProps) => {
  if (!attendees.length) {
    return <Text className="text-gray-900 text-sm mx-2">Ingen påmeldte</Text>
  }

  return attendees.map((attendee, index) => {
    const UserEntry = getAttendeeListEntryComponent(attendee)
    const minWidth = getMinWidth(maxNumberOfAttendees)

    return (
      <div key={attendee.id} className="flex flex-row gap-1 items-center group">
        <Text
          className={cn(
            "text-gray-400 group-hover:text-black dark:text-stone-500 dark:group-hover:text-stone-300",
            "text-right text-sm font-mono transition-colors",
            minWidth
          )}
        >
          {index + 1}.
        </Text>

        <UserEntry attendee={attendee} user={user} />
      </div>
    )
  })
}

const getAttendeeListEntryComponent = (attendee: Attendee) => {
  if (attendee.user.flags.includes("VANITY_VERIFIED")) {
    return VerifiedAttendeeListUser
  }

  if (attendee.user.flags.includes("THE_THINKER")) {
    return TheThinkerAttendeeListUser
  }

  return GenericAttendeeListEntry
}

interface AttendeeListEntryProps {
  attendee: Attendee
  user: User
}

type GenericAttendeeListEntryProps = AttendeeListEntryProps & {
  userSection?: ReactNode
}

const GenericAttendeeListEntry = ({
  attendee,
  user,
  userSection: customUserSection,
}: GenericAttendeeListEntryProps) => {
  const isUser = attendee.userId === user.id

  const userSection = customUserSection ?? (
    <div className="flex flex-col gap-0.5 grow min-w-0">
      <Text className="text-sm truncate" title={attendee.user.name ?? undefined}>
        {attendee.user.name}
      </Text>
      <Text
        className={cn(
          "text-xs truncate",
          !isUser && "text-gray-900 dark:text-stone-300",
          isUser && "text-black dark:text-white"
        )}
      >
        {attendee.userGrade ? `${attendee.userGrade}. klasse` : "Ingen klasse"}
      </Text>
    </div>
  )

  return (
    <Link
      href={`/profil/${attendee.user.profileSlug}`}
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

      {userSection}
    </Link>
  )
}

const VerifiedAttendeeListUser = ({ attendee, user }: AttendeeListEntryProps) => {
  return (
    <Link
      href={`/profil/${attendee.user.profileSlug}`}
      className={cn(
        "flex flex-1 min-w-0 items-center gap-4 p-1.5 rounded-lg w-full overflow-x-hidden transition-colors",
        "bg-gradient-to-r",
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

      <div className="flex flex-col gap-0.5 grow min-w-0">
        <div className="flex items-center gap-2">
          <Text className="text-sm dark:text-black truncate" title={attendee.user.name ?? undefined}>
            {attendee.user.name}
          </Text>
          <Tooltip>
            <TooltipTrigger>
              <IconRosetteDiscountCheckFilled className="size-[1.25em] text-blue-600 dark:text-sky-700" />
            </TooltipTrigger>
            <TooltipContent>
              <Text>OW-verified</Text>
            </TooltipContent>
          </Tooltip>
        </div>
        <Text className="text-xs dark:text-black truncate">
          {attendee.userGrade ? `${attendee.userGrade}. klasse` : "Ingen klasse"}
        </Text>
      </div>
    </Link>
  )
}

const TheThinkerAttendeeListUser = ({ attendee, user }: AttendeeListEntryProps) => {
  const userSection = (
    <div className="flex flex-col gap-0.5 grow min-w-0">
      <div className="flex items-center gap-3 overflow-x-auto">
        <Text className="text-sm text-nowrap">{attendee.user.name}</Text>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <img alt="TheThinker" src="https://i.imgur.com/vVIfdfi.png" className="size-3.5 rounded-sm" />
              <Text className="text-[0.6rem] font-medium text-gray-500 dark:text-stone-300" element="span">
                TheThinker
              </Text>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <Text>"inshallah hehehe suiii" - en vis mann</Text>
          </TooltipContent>
        </Tooltip>
      </div>

      <Text className="text-xs truncate">{attendee.userGrade ? `${attendee.userGrade}. klasse` : "Ingen klasse"}</Text>
    </div>
  )

  return <GenericAttendeeListEntry attendee={attendee} user={{ ...user, id: "1" }} userSection={userSection} />
}
