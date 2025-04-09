import { useTRPC } from "@/utils/trpc/client"
import type { Attendee } from "@dotkomonline/types"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Icon,
  TableBody,
  TableCell,
  TableRow,
} from "@dotkomonline/ui"
import { Table } from "@dotkomonline/ui"
import { TableRowDivider } from "@dotkomonline/ui/src/components/Table/Table"
import { useQuery } from "@tanstack/react-query"

const AttendeeRows = ({ attendees }: { attendees: Attendee[] }) => (
  <>
    {attendees.map((attendee, index) => (
      <TableRow key={attendee.id}>
        <TableCell>{attendee.displayName}</TableCell>
        <TableCell>{attendee.userGrade}</TableCell>
        <TableCell>{index + 1}</TableCell>
      </TableRow>
    ))}
  </>
)

const AttendeesTable = ({ attendees }: { attendees: Attendee[] }) => {
  const reservedAttendees = attendees.filter((attendee) => attendee.reserved)
  const waitlistAttendees = attendees.filter((attendee) => !attendee.reserved)

  return (
    <Table>
      <TableBody>
        <AttendeeRows attendees={reservedAttendees} />
        {waitlistAttendees.length > 0 && <TableRowDivider>Venteliste</TableRowDivider>}
        <AttendeeRows attendees={waitlistAttendees} />
      </TableBody>
    </Table>
  )
}

interface ViewAttendeesDialogButtonProps {
  setAttendeeListOpen: (open: boolean) => void
  attendeeListOpen: boolean
  attendanceId: string
  title: string
}

const ViewAttendeesDialogButton = ({
  title,
  attendanceId,
  attendeeListOpen,
  setAttendeeListOpen,
}: ViewAttendeesDialogButtonProps) => {
  const trpc = useTRPC()
  const { data: attendees } = useQuery(
    trpc.attendance.getAttendees.queryOptions({
      id: attendanceId,
    })
  )

  return (
    <AlertDialog open={attendeeListOpen} onOpenChange={setAttendeeListOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full rounded-lg uppercase bg-blue-10 h-100 py-4">Vis påmeldte</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-full p-8" onClickOutside={() => setAttendeeListOpen(false)}>
        <div className="flex flex-row justify-between">
          <AlertDialogTitle className="mt-0">{title}</AlertDialogTitle>

          <AlertDialogCancel asChild>
            <Button className="rounded-lg uppercase bg-blue-10 h-100">
              <Icon className="text-lg" icon="tabler:x" />
            </Button>
          </AlertDialogCancel>
        </div>

        {attendees && <AttendeesTable attendees={attendees} />}
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ViewAttendeesDialogButton
