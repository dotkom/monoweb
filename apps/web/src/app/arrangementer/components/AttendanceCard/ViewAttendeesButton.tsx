import type { User, Attendance } from "@dotkomonline/types"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Text,
  Title,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
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
  const reservedAttendees = allAttendees.filter((attendee) => attendee.reserved)
  const waitlistAttendees = allAttendees.filter((attendee) => !attendee.reserved)

  const maxAttendees = Math.max(reservedAttendees.length, waitlistAttendees.length)

  const button = (
    <Button
      className="rounded-lg w-full h-fit min-h-[4rem] text-base font-medium bg-gray-200 hover:bg-gray-100 dark:bg-stone-700 dark:hover:bg-stone-600"
      icon={<IconUsers className="size-[1.25em]" />}
      disabled={!user}
    >
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
    <AlertDialog open={attendeeListOpen} onOpenChange={setAttendeeListOpen}>
      <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
      <AlertDialogContent size="lg" className="p-0!" onOutsideClick={() => setAttendeeListOpen(false)}>
        <div className="flex items-center justify-between px-4 pt-4 rounded-t-lg">
          <AlertDialogTitle asChild>
            <Title element="h1" size="lg">
              Påmeldingsliste
            </Title>
          </AlertDialogTitle>
          <AlertDialogCancel>
            <IconX className="size-[1.25em]" />
          </AlertDialogCancel>
        </div>

        <div className="flex flex-col gap-1 px-4 pb-4 rounded-lg min-h-[25dvh] max-h-[75dvh] overflow-y-auto">
          <div className="flex flex-col gap-2">
            <Title className="font-medium text-base px-2 py-1 bg-gray-100 dark:bg-stone-700 rounded-md sticky top-0 z-10">
              Påmeldte
            </Title>

            <AttendeeList attendees={reservedAttendees} maxNumberOfAttendees={maxAttendees} user={user} />
          </div>

          {waitlistAttendees.length > 0 && (
            <div className="flex flex-col gap-2 mt-6">
              <Title className="font-medium text-base px-2 py-1 bg-gray-100 dark:bg-stone-700 rounded-md sticky top-0 z-10">
                Venteliste
              </Title>
              <AttendeeList attendees={waitlistAttendees} maxNumberOfAttendees={maxAttendees} user={user} />
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
