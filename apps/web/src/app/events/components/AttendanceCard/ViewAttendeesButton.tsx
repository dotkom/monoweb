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
import { AttendeesList } from "./AttendeesList"

interface ViewAttendeesDialogButtonProps {
  attendeeListOpen: boolean
  setAttendeeListOpen: (open: boolean) => void
  attendanceId: string
}

export const ViewAttendeesDialogButton = ({
  attendeeListOpen,
  setAttendeeListOpen,
  attendanceId,
}: ViewAttendeesDialogButtonProps) => (
  <AlertDialog open={attendeeListOpen} onOpenChange={setAttendeeListOpen}>
    <AlertDialogTrigger asChild>
      <Button className="w-full text-black rounded-lg bg-slate-4 hover:bg-slate-5 h-fit min-h-[4rem]">
        <Icon className="text-lg" icon="tabler:users" />
        <Text>Vis påmeldte</Text>
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent className="w-full max-w-2xl" onOutsideClick={() => setAttendeeListOpen(false)}>
      <div className="flex items-center justify-between">
        <AlertDialogTitle>Påmeldte</AlertDialogTitle>
        <AlertDialogCancel asChild className="p-0 hover:bg-transparent">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Icon className="text-lg" icon="tabler:x" />
          </Button>
        </AlertDialogCancel>
      </div>
      <AttendeesList attendanceId={attendanceId} />
    </AlertDialogContent>
  </AlertDialog>
)
