import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTrigger, Button, Icon } from "@dotkomonline/ui"

interface ViewAttendeesDialogButtonProps {
  attendeeListOpen: boolean
  setAttendeeListOpen: (open: boolean) => void
}

const ViewAttendeesDialogButton = ({ attendeeListOpen, setAttendeeListOpen }: ViewAttendeesDialogButtonProps) => (
  <AlertDialog open={attendeeListOpen} onOpenChange={setAttendeeListOpen}>
    <AlertDialogTrigger asChild>
      <Button className="w-full rounded-lg uppercase bg-blue-10 h-100">Vis påmeldte</Button>
    </AlertDialogTrigger>
    <AlertDialogContent className="w-full relative">
      <AlertDialogCancel asChild className="absolute top-0 right-0">
        <Button className="rounded-lg uppercase bg-blue-10 h-100">
          <Icon className="text-lg" icon="tabler:x" />
        </Button>
      </AlertDialogCancel>
      <h4 className="important:mt-0">Påmeldte</h4>
    </AlertDialogContent>
  </AlertDialog>
)

export default ViewAttendeesDialogButton
