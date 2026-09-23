"use client"

import { ConfirmModal } from "@admin/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import {
  ACTIVE_SLOT_CLASSES,
  CalendarEventBody,
  CalendarSlot,
  SlotCalendar,
  SlotPopup,
} from "../../../../components/Calendar/Calendar"
import {
  getSlotPanel,
  INTERVIEW_SLOT_COLORS,
  REQUIRED_ATTENDEES,
  toSlotEventColors,
} from "../../../../components/Calendar/slot-layout"
import { InterviewAttendee } from "../../../../components/Cells"
import { CopyButton } from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import type { CommitteeApplicationMatchedInterview } from "@dotkomonline/rpc/committee-application"
import { Button, cn, Text } from "@dotkomonline/ui"
import interactionPlugin from "@fullcalendar/interaction"
import {
  IconArrowUpRight,
  IconMapPin,
  IconUser,
  IconUserMinus,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react"
import { getDay } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"

const EXPANDED_ROWS = 10
const LAST_WEEKDAY = 5
const POPUP_TARGET_SELECTOR = "button, .slot-popup, [data-slot^='alert-dialog']"

const SELECTION_CLASSES = cn(
  ACTIVE_SLOT_CLASSES,
  "[&_.fc-timegrid-event]:cursor-pointer! [&_.fc-timegrid-event]:my-[1.5px]! [&_.fc-timegrid-event]:rounded-[4px]! [&_.fc-timegrid-col-events:has(.slot-active)]:z-10!"
)

const getInterviewColors = (isAdded: boolean, attendeeCount: number) =>
  isAdded
    ? INTERVIEW_SLOT_COLORS.own
    : attendeeCount >= REQUIRED_ATTENDEES
      ? INTERVIEW_SLOT_COLORS.staffed
      : INTERVIEW_SLOT_COLORS.understaffed

type InterviewSlotProps = {
  interview: CommitteeApplicationMatchedInterview
  timeText: string
  isActive: boolean
  isAdded: boolean
  canAttend: boolean
  onAdd: () => void
  onRemove: () => void
  onOpenApplicant: () => void
}

function InterviewSlot({
  interview,
  timeText,
  isActive,
  isAdded,
  canAttend,
  onAdd,
  onRemove,
  onOpenApplicant,
}: InterviewSlotProps) {
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false)
  const { attendees } = interview
  const attendeeCount = attendees.length === 0 ? "ingen" : attendees.length

  return (
    <CalendarSlot isActive={isActive} className="relative flex h-full w-full flex-col rounded-[4px]">
      <CalendarEventBody
        timeText={timeText}
        title={interview.name}
        locationName={interview.locationName}
        titleIcon={<IconUser className="size-3.5 shrink-0 opacity-45" stroke={2} />}
        accentColor={getInterviewColors(isAdded, attendees.length).border}
        trailing={
          <Text
            element="span"
            className="flex shrink-0 items-center gap-1 text-xs leading-none"
            title={`${attendeeCount} deltar i intervjuet`}
          >
            <IconUsers className="size-3.5 shrink-0 opacity-45" stroke={2} />
            {attendeeCount}
          </Text>
        }
      />

      {isActive && (
        <SlotPopup
          label={`Detaljer for intervju med ${interview.name}`}
          anchorsToBottom={getSlotPanel(interview.startsAt, interview.endsAt, EXPANDED_ROWS).anchorsToBottom}
          opensToLeft={getDay(interview.startsAt) === LAST_WEEKDAY}
        >
          <div className="flex items-baseline justify-between gap-2">
            <Text element="span" className="min-w-0 truncate text-sm font-semibold leading-tight">
              {interview.name}
            </Text>
            <Text element="span" className="shrink-0 text-xs leading-tight opacity-60">
              {timeText}
            </Text>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Text element="span" className="flex shrink-0 items-center gap-1.5">
              <IconMapPin className="size-3.5 shrink-0 opacity-45" stroke={2} />
              {interview.locationName}
            </Text>
            {interview.locationUrl !== null && (
              <CopyButton value={interview.locationUrl} label="Kopier Mazemap-link" compact />
            )}
          </div>

          <button
            type="button"
            className="-mt-1 flex cursor-pointer items-center gap-0.5 self-start text-xs text-muted-foreground hover:text-foreground hover:underline"
            onClick={onOpenApplicant}
          >
            Søkeropplysninger
            <IconArrowUpRight className="size-3.5" stroke={2} />
          </button>

          <div className="mt-2 flex flex-col gap-1.5 border-t pt-4">
            <Text element="span" className="text-xs font-semibold leading-none">
              Deltar i intervjuet
            </Text>
            {attendees.length === 0 ? (
              <Text element="span" className="text-xs italic leading-none opacity-55">
                Ingen har meldt seg på ennå
              </Text>
            ) : (
              attendees.map((attendee) => <InterviewAttendee key={attendee.userId} attendee={attendee} size="sm" />)
            )}
          </div>

          {canAttend && (
            <div className="mt-2 flex items-center gap-1.5">
              {isAdded ? (
                <Button variant="destructive" size="sm" onClick={() => setIsRemoveConfirmOpen(true)}>
                  Meld meg av
                </Button>
              ) : (
                <Button variant="default" size="sm" icon={<IconUserPlus />} onClick={onAdd}>
                  Delta i intervjuet
                </Button>
              )}
            </div>
          )}

          <ConfirmModal
            open={isRemoveConfirmOpen}
            onOpenChange={setIsRemoveConfirmOpen}
            size="sm"
            title={`Er du sikker på at du vil melde deg av intervjuet med ${interview.name}?`}
            description="Du blir fjernet som deltager, og andre i komitéen kan melde seg på i stedet."
            confirmLabel="Ja, meld meg av"
            confirmIcon={<IconUserMinus className="size-4" />}
            destructive
            onConfirm={onRemove}
          />
        </SlotPopup>
      )}
    </CalendarSlot>
  )
}

type InterviewCalendarProps = {
  initialDate: Date
  interviews: CommitteeApplicationMatchedInterview[]
  addedInterviewIds: ReadonlySet<string>
  canAttend: boolean
  onAddInterview: (applicationId: string) => void
  onRemoveInterview: (applicationId: string) => void
}

export function InterviewCalendar({
  initialDate,
  interviews,
  addedInterviewIds,
  canAttend,
  onAddInterview,
  onRemoveInterview,
}: InterviewCalendarProps) {
  const router = useRouter()
  const { id, groupId } = useParams<{ id: string; groupId: string }>()

  const events = useMemo(
    () =>
      interviews.map((interview) => ({
        id: interview.applicationId,
        title: interview.name,
        start: interview.startsAt,
        end: interview.endsAt,
        ...toSlotEventColors(
          getInterviewColors(addedInterviewIds.has(interview.applicationId), interview.attendees.length)
        ),
      })),
    [interviews, addedInterviewIds]
  )

  return (
    <SlotCalendar
      heading="Intervjuer"
      initialDate={initialDate}
      className={SELECTION_CLASSES}
      plugins={[interactionPlugin]}
      slotEventOverlap={false}
      events={events}
      slots={interviews}
      getSlotId={(interview) => interview.applicationId}
      fieldSelector={POPUP_TARGET_SELECTOR}
      renderSlot={(interview, { timeText, isActive }) => (
        <InterviewSlot
          interview={interview}
          timeText={timeText}
          isActive={isActive}
          isAdded={addedInterviewIds.has(interview.applicationId)}
          canAttend={canAttend}
          onAdd={() => onAddInterview(interview.applicationId)}
          onRemove={() => onRemoveInterview(interview.applicationId)}
          onOpenApplicant={() => router.push(`/admin/opptak/${id}/opplysninger/${groupId}/${interview.applicationId}`)}
        />
      )}
    />
  )
}
