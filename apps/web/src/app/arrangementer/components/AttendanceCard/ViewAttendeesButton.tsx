import type { Attendee, User } from "@dotkomonline/types"
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
  Icon,
  Text,
  Title,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  cn,
} from "@dotkomonline/ui"
import Link from "next/link"

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
  attendees: Attendee[]
  isLoggedIn: boolean
  userId: User["id"] | undefined
}

export const ViewAttendeesButton = ({
  attendeeListOpen,
  setAttendeeListOpen,
  attendees,
  isLoggedIn,
  userId,
}: ViewAttendeesButtonProps) => {
  const reservedAttendees = attendees.filter((attendee) => attendee.reserved)
  const waitlistAttendees = attendees.filter((attendee) => !attendee.reserved)

  const maxAttendees = Math.max(reservedAttendees.length, waitlistAttendees.length)

  const hasWaitlist = waitlistAttendees.length > 0

  const button = (
    <Button
      color="light"
      className="rounded-lg w-full h-fit min-h-[4rem] font-medium"
      icon={<Icon className="text-lg" icon="tabler:users" />}
      disabled={!isLoggedIn}
    >
      Vis påmeldte
    </Button>
  )

  if (!isLoggedIn) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent sideOffset={-10}>
            <Text>Du må være innlogget for å se påmeldte</Text>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <AlertDialog open={attendeeListOpen} onOpenChange={setAttendeeListOpen}>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent
        className="flex flex-col gap-4 w-full p-0 bg-white dark:bg-stone-900 drop-shadow-lg max-w-2xl rounded-lg"
        onOutsideClick={() => setAttendeeListOpen(false)}
      >
        <div className="flex items-center justify-between px-4 pt-4 rounded-t-lg">
          <AlertDialogTitle asChild>
            <Title element="h1" size="lg">
              Påmeldingsliste
            </Title>
          </AlertDialogTitle>
          <AlertDialogCancel className="p-2">
            <Icon className="text-xl" icon="tabler:x" />
          </AlertDialogCancel>
        </div>

        <div className="flex flex-col gap-1 px-4 pb-4 rounded-lg min-h-[25dvh] max-h-[75dvh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <Title className="text-base px-2 py-1 bg-gray-100 dark:bg-stone-800 rounded-md sticky top-0 z-10">
              Påmeldte
            </Title>

            <AttendeeList attendees={reservedAttendees} maxNumberOfAttendees={maxAttendees} userId={userId} />
          </div>

          {hasWaitlist && (
            <div className="flex flex-col gap-2 mt-6">
              <Title className="font-normal text-base px-2 py-1 bg-gray-100 dark:bg-stone-800 rounded-md sticky top-0 z-10">
                Venteliste
              </Title>
              <AttendeeList attendees={waitlistAttendees} maxNumberOfAttendees={maxAttendees} userId={userId} />
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface AttendeeListProps {
  attendees: Attendee[]
  maxNumberOfAttendees: number
  userId: User["id"] | undefined
}

const AttendeeList = ({ attendees, maxNumberOfAttendees, userId }: AttendeeListProps) => {
  if (!attendees.length) {
    return <Text className="text-gray-900 text-sm mx-2">Ingen påmeldte</Text>
  }

  return attendees.map((attendee, index) => {
    const minWidth = getMinWidth(maxNumberOfAttendees)

    const isVerified = attendee.user.flags.includes("VANITY_VERIFIED")
    const isUser = attendee.userId === userId

    return (
      <div key={attendee.id} className="flex flex-row gap-1 items-center group">
        <Text
          className={cn(
            "text-gray-400 group-hover:text-black dark:text-stone-600 dark:group-hover:text-stone-300 text-right text-sm font-mono transition-colors",
            minWidth
          )}
        >
          {index + 1}.
        </Text>

        <Link
          href={`/profil/${attendee.user.profileSlug}`}
          className={cn(
            "flex items-center gap-4 p-1.5 rounded-lg w-full transition-colors",
            !isVerified && !isUser && "hover:bg-gray-100 dark:hover:bg-stone-800",
            isUser && !isVerified && "bg-blue-100 hover:bg-blue-200 dark:bg-sky-950 dark:hover:bg-sky-900",
            isVerified && [
              "bg-gradient-to-r",
              "from-yellow-200 via-yellow-100 hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-200",
              "dark:from-yellow-500 dark:via-yellow-600 dark:hover:from-yellow-400 dark:hover:via-yellow-500 dark:hover:to-yellow-800",
            ]
          )}
        >
          <Avatar
            className={cn(
              "h-10 w-10",
              (isVerified || isUser) && "outline-2 outline-offset-1",
              isVerified && "outline-yellow-500 dark:outline-yellow-600",
              isUser && !isVerified && "outline-blue-500 dark:outline-sky-800"
            )}
          >
            <AvatarImage src={attendee.user.image ?? undefined} />
            <AvatarFallback
              className={
                isVerified
                  ? "bg-yellow-500 dark:bg-yellow-700"
                  : isUser
                    ? "bg-blue-500 dark:bg-sky-800"
                    : "bg-gray-500 dark:bg-stone-600"
              }
            >
              <Icon className="text-lg" icon="tabler:user" />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-0.5">
            {isVerified ? (
              <div className="flex items-center gap-1">
                <Text className="text-sm dark:text-black">{attendee.user.name}</Text>
                <Icon
                  icon="tabler:rosette-discount-check-filled"
                  className="text-base text-blue-600 dark:text-sky-700"
                />
              </div>
            ) : (
              <Text className="text-sm">{attendee.user.name}</Text>
            )}
            <Text
              className={cn(
                "text-xs",
                isVerified
                  ? "dark:text-black"
                  : isUser
                    ? "text-black dark:text-white"
                    : "text-gray-900 dark:text-stone-400"
              )}
            >
              {attendee.userGrade ? `${attendee.userGrade}. klasse` : "Ingen klasse"}
            </Text>
          </div>
        </Link>
      </div>
    )
  })
}
