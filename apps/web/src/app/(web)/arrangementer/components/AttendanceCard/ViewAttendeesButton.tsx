import type { AttendanceView } from "@dotkomonline/rpc/attendance"
import type { User } from "@dotkomonline/rpc/user"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Text,
  Title,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  DialogClose,
  cn,
} from "@dotkomonline/ui"
import { IconUsers, IconX } from "@tabler/icons-react"
import { compareAsc } from "date-fns"
import { AttendeeList } from "./AttendeeList/AttendeeList"

interface ViewAttendeesButtonProps {
  attendeeListOpen: boolean
  setAttendeeListOpen: (open: boolean) => void
  attendance: AttendanceView
  user: User | null
  hasTicketButton: boolean
}

export const ViewAttendeesButton = ({
  attendeeListOpen,
  setAttendeeListOpen,
  attendance,
  user,
  hasTicketButton,
}: ViewAttendeesButtonProps) => {
  const allAttendees = attendance.attendees.toSorted((firstAttendee, secondAttendee) =>
    compareAsc(firstAttendee.registrationEligibleAt, secondAttendee.registrationEligibleAt)
  )
  const registeredAttendees = allAttendees.filter((attendee) => attendee.registeredAt !== null)
  const queuedAttendees = allAttendees.filter((attendee) => attendee.registeredAt === null)

  const maxAttendees = Math.max(registeredAttendees.length, queuedAttendees.length)

  const button = (
    <Button
      className="rounded-lg w-full h-fit min-h-16 text-base font-medium bg-gray-200 hover:bg-gray-100 dark:bg-stone-700 dark:hover:bg-stone-600"
      disabled={!user}
    >
      <div
        className={cn(
          "mx-auto grid w-fit max-w-full min-w-0 grid-cols-[--spacing(4.5)_minmax(0,1fr)_--spacing(4.5)] items-center gap-x-2",
          hasTicketButton && "sm:flex"
        )}
      >
        <span aria-hidden className="flex h-lh items-center justify-center">
          <IconUsers className="size-4.5" />
        </span>
        <Text element="span" className="min-w-0 text-center font-medium">
          Vis påmeldte
        </Text>
      </div>
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
      <DialogContent size="lg" className="p-0!">
        <DialogHeader className="flex-row items-center justify-between px-4 pt-4 rounded-t-lg">
          <DialogTitle asChild>
            <Title element="h1" size="lg">
              Påmeldingsliste
            </Title>
          </DialogTitle>
          <DialogClose>
            <IconX className="size-[1.25em]" />
          </DialogClose>
        </DialogHeader>

        <DialogBody className="mx-0 mb-0 min-h-[25dvh]">
          <div className="flex flex-col gap-1 px-3 pb-3">
            <div className="flex flex-col gap-2">
              <Title className="font-medium text-base px-2 py-1 bg-gray-100 dark:bg-stone-700 rounded-md sticky top-0 z-30">
                Påmeldte
              </Title>

              <AttendeeList attendees={registeredAttendees} maxNumberOfAttendees={maxAttendees} user={user} />
            </div>

            {queuedAttendees.length > 0 && (
              <div className="flex flex-col gap-2 mt-6">
                <Title className="font-medium text-base px-2 py-1 bg-gray-100 dark:bg-stone-700 rounded-md sticky top-0 z-30">
                  Kø
                </Title>
                <AttendeeList attendees={queuedAttendees} maxNumberOfAttendees={maxAttendees} user={user} />
              </div>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
