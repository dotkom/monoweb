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
  cn,
} from "@dotkomonline/ui"

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
  userId: User["id"] | undefined
}

export const ViewAttendeesButton = ({
  attendeeListOpen,
  setAttendeeListOpen,
  attendees,
  userId,
}: ViewAttendeesButtonProps) => {
  const reservedAttendees = attendees.filter((attendee) => attendee.reserved)
  const waitlistAttendees = attendees.filter((attendee) => !attendee.reserved)

  const maxAttendees = Math.max(reservedAttendees.length, waitlistAttendees.length)

  const hasWaitlist = waitlistAttendees.length > 0

  return (
    <AlertDialog open={attendeeListOpen} onOpenChange={setAttendeeListOpen}>
      <AlertDialogTrigger asChild>
        <Button
          color="light"
          className="rounded-lg w-full h-fit min-h-[4rem] font-medium"
          icon={<Icon className="text-lg" icon="tabler:users" />}
        >
          Vis påmeldte
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        className="flex flex-col gap-4 w-full p-0 bg-gray-100 drop-shadow-lg max-w-2xl rounded-lg"
        onOutsideClick={() => setAttendeeListOpen(false)}
      >
        <div className="flex items-center justify-between px-4 pt-4 rounded-t-lg">
          <AlertDialogTitle asChild>
            <Title element="h1" size="xl">
              Påmeldingsliste
            </Title>
          </AlertDialogTitle>
          <AlertDialogCancel className="p-2">
            <Icon className="text-xl" icon="tabler:x" />
          </AlertDialogCancel>
        </div>

        <div className="flex flex-col gap-1 px-4 pb-4 rounded-lg min-h-[25dvh] max-h-[75dvh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <Title className="font-normal text-base px-2 py-1 bg-gray-200 rounded-md sticky top-0 z-10">Påmeldte</Title>

            <AttendeeList
              attendees={reservedAttendees}
              maxNumberOfAttendees={maxAttendees}
              userId={userId}
            />
          </div>

          {hasWaitlist && (
            <div className="flex flex-col gap-2 mt-6">
              <Title className="font-normal text-base px-2 py-1 bg-gray-200 rounded-md sticky top-0 z-10">
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

const AttendeeList = ({ attendees, maxNumberOfAttendees, userId, }: AttendeeListProps) => {
  if (!attendees.length) {
    return <Text className="text-gray-900 text-sm mx-2">Ingen påmeldte</Text>
  }

  return attendees.map((attendee, index) => {
    const minWidth = getMinWidth(maxNumberOfAttendees)

    const isVerified = attendee.user.flags.includes("VANITY_VERIFIED")
    const isUser = attendee.userId === userId

    return (
      <div key={attendee.id} className="flex flex-row gap-1 items-center">
        <Text className={cn("text-gray-700 text-right text-sm font-mono", minWidth)}>{index + 1}.</Text>

        <div
          className={cn(
            "flex items-center gap-4 p-1.5 rounded-lg w-full",
            isUser && !isVerified && "bg-blue-200",
            isVerified && "bg-gradient-to-r from-yellow-300 via-yellow-200"
          )}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={attendee.user.image ?? undefined} />
            <AvatarFallback className={isVerified ? "bg-yellow-500" : isUser ? "bg-blue-500" : "bg-gray-500"}>
              <Icon className="text-lg" icon="tabler:user" />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-0.5">
            {isVerified ? (
              <div className="flex items-center gap-1">
                <Text className="text-sm">{attendee.user.displayName}</Text>
                <Icon icon="tabler:rosette-discount-check-filled" className="text-base text-blue-800" />
              </div>
            ) : (
              <Text className="text-sm">{attendee.user.displayName}</Text>
            )}
            <Text className={cn("text-xs", isUser ? "text-black" : "text-gray-900")}>
              {attendee.userGrade ? `${attendee.userGrade}. klasse` : "Ingen klasse"}
            </Text>
          </div>
        </div>
      </div>
    )
  })
}
