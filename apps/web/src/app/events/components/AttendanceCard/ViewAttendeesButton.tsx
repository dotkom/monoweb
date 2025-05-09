import type { Attendee, User } from "@dotkomonline/types"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Icon,
  Text,
  Title,
} from "@dotkomonline/ui"
import { AttendeeList } from "./AttendeeList"

interface ViewAttendeesDialogButtonProps {
  attendeeListOpen: boolean
  setAttendeeListOpen: (open: boolean) => void
  attendees: Attendee[]
  userId: User["id"] | undefined
}

export const ViewAttendeesDialogButton = ({
  attendeeListOpen,
  setAttendeeListOpen,
  attendees,
  userId,
}: ViewAttendeesDialogButtonProps) => {
  const reservedAttendees = attendees?.filter((attendee) => attendee.reserved)
  const waitlistAttendees = attendees?.filter((attendee) => !attendee.reserved)

  const maxAttendees = Math.max(reservedAttendees?.length ?? 0, waitlistAttendees?.length ?? 0)

  return (
    <AlertDialog open={attendeeListOpen} onOpenChange={setAttendeeListOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="unstyled"
          className="w-full text-black rounded-lg bg-slate-3 hover:bg-slate-4 h-fit min-h-[4rem]"
        >
          <Icon className="text-lg" icon="tabler:users" />
          <Text className="font-medium">Vis påmeldte</Text>
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
          <AlertDialogCancel asChild className="p-0 hover:bg-transparent">
            <Button variant="unstyled" className="h-8 w-8">
              <Icon className="text-xl" icon="tabler:x" />
            </Button>
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
