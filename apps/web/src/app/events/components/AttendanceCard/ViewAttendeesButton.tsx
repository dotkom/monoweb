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

  return (
    <AlertDialog open={attendeeListOpen} onOpenChange={setAttendeeListOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full text-black rounded-lg bg-slate-4 hover:bg-slate-5 h-fit min-h-[4rem]">
          <Icon className="text-lg" icon="tabler:users" />
          <Text className="font-medium">Vis påmeldte</Text>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        className="flex flex-col gap-4 w-full bg-slate-2 outline outline-slate-4 max-w-2xl p-4 rounded-lg"
        onOutsideClick={() => setAttendeeListOpen(false)}
      >
        <div className="flex items-center justify-between">
          <AlertDialogTitle asChild>
            <Title className="font-poppins font-semibold text-xl">Påmeldingsliste</Title>
          </AlertDialogTitle>
          <AlertDialogCancel asChild className="p-0 hover:bg-transparent">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Icon className="text-lg" icon="tabler:x" />
            </Button>
          </AlertDialogCancel>
        </div>

        <div className="flex flex-col gap-4 max-h-[75dvh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <Title className="font-poppins font-normal text-lg">Påmeldte</Title>
            {reservedAttendees !== undefined && <AttendeeList attendees={reservedAttendees} userId={userId} />}
          </div>

          {waitlistAttendees && waitlistAttendees.length > 0 && (
            <>
              <hr className="border border-slate-4" />
              <div className="flex flex-col gap-2">
                <Title className="font-poppins font-normal text-lg">Venteliste</Title>
                <AttendeeList attendees={waitlistAttendees} userId={userId} />
              </div>
            </>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
