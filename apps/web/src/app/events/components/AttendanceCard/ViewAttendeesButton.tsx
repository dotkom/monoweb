import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Icon,
} from "@dotkomonline/ui"

interface ViewAttendeesDialogButtonProps {
  attendeeListOpen: boolean
  setAttendeeListOpen: (open: boolean) => void
}

export const ViewAttendeesDialogButton = ({
  attendeeListOpen,
  setAttendeeListOpen,
}: ViewAttendeesDialogButtonProps) => (
  <AlertDialog open={attendeeListOpen} onOpenChange={setAttendeeListOpen}>
    <AlertDialogTrigger asChild>
      <Button className="w-full text-black rounded-lg bg-slate-4 hover:bg-slate-5 h-fit min-h-[4rem]">
        <Icon className="text-lg" icon="tabler:users" />
        Vis påmeldte
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent className="w-full relative">
      <AlertDialogTitle>Vis påmeldte</AlertDialogTitle>
      <AlertDialogCancel asChild className="absolute top-4 right-2">
        <Button className="rounded-lg uppercase h-100">
          <Icon className="text-lg" icon="tabler:x" />
        </Button>
      </AlertDialogCancel>
      <h4 className="important:mt-0">Påmeldte</h4>
    </AlertDialogContent>
  </AlertDialog>
)
