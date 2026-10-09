import type { Attendance } from "@dotkomonline/rpc/attendance"
import type { User } from "@dotkomonline/rpc/user"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Button,
  Text,
  Title,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  DialogClose,
} from "@dotkomonline/ui"
import { IconUsers, IconX } from "@tabler/icons-react"
import { compareAsc } from "date-fns"
import { AttendeeList } from "./AttendeeList/AttendeeList"

interface ViewAttendeesButtonProps {
  attendeeListOpen: boolean
  setAttendeeListOpen: (open: boolean) => void
  attendance: Attendance
  user: User | null
}

export const ViewAttendeesButton = ({
  attendeeListOpen,
  setAttendeeListOpen,
  attendance,
  user,
}: ViewAttendeesButtonProps) => {
  const allAttendees = attendance.attendees.toSorted((a, b) =>
    compareAsc(a.earliestReservationAt, b.earliestReservationAt)
  )
  const registeredAttendees = allAttendees.filter((attendee) => attendee.registered)
  const queuedAttendees = allAttendees.filter((attendee) => !attendee.registered)

  const maxAttendees = Math.max(registeredAttendees.length, queuedAttendees.length)

  const button = (
    <Button
      className="rounded-lg w-full h-fit min-h-16 text-base font-medium bg-gray-200 hover:bg-gray-100 dark:bg-stone-700 dark:hover:bg-stone-600"
      disabled={!user}
    >
      <IconUsers className="size-[1.25em]" />
      Vis påmeldte
    </Button>
  )

  if (!user) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <span className="inline-flex w-full">{button}</span>
        </TooltipTrigger>
        <TooltipContent sideOffset={-10}>
          <Text>Du må være innlogget for å se påmeldte</Text>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Dialog open={attendeeListOpen} onOpenChange={setAttendeeListOpen}>
      <DialogTrigger asChild>{button}</DialogTrigger>
      <DialogContent size="lg" className="p-0!" onOutsideClick={() => setAttendeeListOpen(false)}>
        <div className="flex items-center justify-between px-4 pt-4 rounded-t-lg">
          <DialogTitle asChild>
            <Title element="h1" size="lg">
              Påmeldingsliste
            </Title>
          </DialogTitle>
          <DialogClose>
            <IconX className="size-[1.25em]" />
          </DialogClose>
        </div>

        <div className="flex flex-col gap-1 px-4 pb-4 rounded-lg min-h-[25dvh] max-h-[75dvh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <Title className="font-medium text-base px-2 py-1 bg-gray-100 dark:bg-stone-700 rounded-md sticky top-0 z-30">
              Påmeldte
            </Title>

            <AttendeeList attendees={registeredAttendees} maxNumberOfAttendees={maxAttendees} user={user} />
          </div>

          {queuedAttendees.length > 0 && (
            <div className="flex flex-col gap-2 mt-6">
              <Title className="font-medium text-base px-2 py-1 bg-gray-100 dark:bg-stone-700 rounded-md sticky top-0 z-30">
                Venteliste
              </Title>
              <AttendeeList attendees={queuedAttendees} maxNumberOfAttendees={maxAttendees} user={user} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
