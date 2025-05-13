import type { Attendee, User } from "@dotkomonline/types"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  AvatarFallback,
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
  const reservedAttendees = attendees?.filter((attendee) => attendee.reserved)
  const waitlistAttendees = attendees?.filter((attendee) => !attendee.reserved)

  const maxAttendees = Math.max(reservedAttendees?.length ?? 0, waitlistAttendees?.length ?? 0)

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
        className="flex flex-col gap-4 w-full p-0 bg-slate-2 drop-shadow-lg max-w-2xl rounded-lg"
        onOutsideClick={() => setAttendeeListOpen(false)}
      >
        <div className="flex items-center justify-between px-4 pt-4 rounded-t-lg">
          <AlertDialogTitle asChild>
            <Title className="font-poppins font-semibold text-2xl">Påmeldingsliste</Title>
          </AlertDialogTitle>
          <AlertDialogCancel className="p-2">
            <Icon className="text-xl" icon="tabler:x" />
          </AlertDialogCancel>
        </div>

        <div className="flex flex-col gap-1 px-4 pb-4 rounded-lg max-h-[75dvh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <Title className="font-poppins font-normal text-base px-2 py-1 bg-slate-3 rounded-md sticky top-0 z-10">
              Påmeldte
            </Title>
            {reservedAttendees !== undefined && (
              <AttendeeList
                attendees={reservedAttendees}
                maxNumberOfAttendees={maxAttendees}
                userId={userId}
                marginOnLastItem
              />
            )}
          </div>

          {waitlistAttendees && waitlistAttendees.length > 0 && (
            <div className="flex flex-col gap-2">
              <Title className="font-poppins font-normal text-base px-2 py-1 bg-slate-3 rounded-md sticky top-0 z-10">
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
  marginOnLastItem?: boolean
}

const AttendeeList = ({ attendees, maxNumberOfAttendees, userId, marginOnLastItem = false }: AttendeeListProps) => {
  if (!attendees.length) {
    return <Text className="text-slate-10 text-sm">Ingen påmeldte</Text>
  }

  return attendees.map((attendee: Attendee, index) => {
    const isLastItem = index === attendees.length - 1

    return (
      <div
        key={attendee.id}
        className={cn("flex flex-row gap-1 items-center", marginOnLastItem && isLastItem && "mb-8")}
      >
        <Text className={cn("text-slate-8 text-right text-sm font-mono", getMinWidth(maxNumberOfAttendees))}>
          {index + 1}.
        </Text>

        <div
          className={cn("flex items-center gap-4 p-1.5 rounded-lg w-full", attendee.userId === userId && "bg-blue-3")}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className={attendee.userId === userId ? "bg-blue-6" : "bg-slate-6"}>
              <Icon className="text-lg" icon="tabler:user" />
            </AvatarFallback>
          </Avatar>

          <div>
            <Text className="text-sm">{attendee.displayName}</Text>
            <Text className={cn("text-xs", attendee.userId === userId ? "text-slate-12" : "text-slate-10")}>
              {attendee.userGrade ? `${attendee.userGrade}. klasse` : "Ingen klasse"}
            </Text>
          </div>
        </div>
      </div>
    )
  })
}
