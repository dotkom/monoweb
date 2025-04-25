import { useTRPC } from "@/utils/trpc/client"
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
import { useQuery } from "@tanstack/react-query"
import { AttendeeList } from "./AttendeeList"

interface ViewAttendeesDialogButtonProps {
  attendeeListOpen: boolean
  setAttendeeListOpen: (open: boolean) => void
  attendanceId: string
}

export const ViewAttendeesDialogButton = ({
  attendeeListOpen,
  setAttendeeListOpen,
  attendanceId,
}: ViewAttendeesDialogButtonProps) => {
  const trpc = useTRPC()

  const { data: attendees, isLoading } = useQuery(
    trpc.attendance.getAttendees.queryOptions(
      {
        attendanceId,
      },
      {
        enabled: attendeeListOpen,
      }
    )
  )

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
        className="w-full bg-slate-2 outline outline-slate-4 max-w-2xl p-4 rounded-lg"
        onOutsideClick={() => setAttendeeListOpen(false)}
      >
        <div className="flex items-center justify-between">
          <AlertDialogTitle asChild>
            <Title>Påmeldte</Title>
          </AlertDialogTitle>
          <AlertDialogCancel asChild className="p-0 hover:bg-transparent">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Icon className="text-lg" icon="tabler:x" />
            </Button>
          </AlertDialogCancel>
        </div>

        <hr className="text-slate-4" />

        {reservedAttendees !== undefined && <AttendeeList attendees={reservedAttendees} />}

        {waitlistAttendees && waitlistAttendees.length > 0 && (
          <>
            <Title>Venteliste</Title>
            <hr className="text-slate-4" />
            <AttendeeList attendees={waitlistAttendees} />
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
