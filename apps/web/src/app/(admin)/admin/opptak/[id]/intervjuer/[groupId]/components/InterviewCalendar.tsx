"use client"

import { ConfirmDeleteModal } from "@admin/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import {
  ACTIVE_SLOT_CLASSES,
  CalendarEventBody,
  CalendarSlot,
  type PopupSide,
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
import type {
  CommitteeApplicationInterviewPeriod,
  CommitteeApplicationMatchedInterview,
} from "@dotkomonline/rpc/committee-application"
import { Button, cn, Text } from "@dotkomonline/ui"
import interactionPlugin from "@fullcalendar/interaction"
import { IconArrowUpRight, IconMapPin, IconUser, IconUserPlus, IconUsers } from "@tabler/icons-react"
import { useParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"

const EXPANDED_ROWS = 10
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
  popupSide: PopupSide
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
  popupSide,
  isAdded,
  canAttend,
  onAdd,
  onRemove,
  onOpenApplicant,
}: InterviewSlotProps) {
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false)
  const { attendees } = interview
  const attendeeCount = attendees.length === 0 ? "ingen" : attendees.length
  const accentColor = getInterviewColors(isAdded, attendees.length).border

  return (
    <CalendarSlot
      isActive={isActive}
      className={cn(
        "relative flex h-full w-full flex-col rounded-[4px]",
        isActive && "text-white dark:text-neutral-950"
      )}
      style={isActive ? { backgroundColor: `color-mix(in oklab, ${accentColor} 80%, transparent)` } : undefined}
    >
      <CalendarEventBody
        timeText={timeText}
        title={interview.name}
        locationName={interview.locationName}
        titleIcon={<IconUser className="size-3.5 shrink-0 opacity-45" stroke={2} />}
        accentColor={accentColor}
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
          side={popupSide}
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
            {interview.locationUrl !== null && <CopyButton value={interview.locationUrl} label="Kopier link" compact />}
          </div>

          <button
            type="button"
            className="-mt-1 flex cursor-pointer items-center gap-0.5 self-start text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            onClick={onOpenApplicant}
          >
            Se info om søkeren
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
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {attendees.map((attendee) => (
                  <InterviewAttendee key={attendee.userId} attendee={attendee} size="sm" />
                ))}
              </div>
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

          <ConfirmDeleteModal
            open={isRemoveConfirmOpen}
            onOpenChange={setIsRemoveConfirmOpen}
            title={`Er du sikker på at du vil melde deg av intervjuet med ${interview.name}?`}
            description="Du blir fjernet som deltager, og andre i komitéen kan melde seg på i stedet."
            confirmLabel="Ja, meld meg av"
            onConfirm={onRemove}
          />
        </SlotPopup>
      )}
    </CalendarSlot>
  )
}

type InterviewCalendarProps = {
  period: CommitteeApplicationInterviewPeriod
  interviews: CommitteeApplicationMatchedInterview[]
  addedInterviewIds: ReadonlySet<string>
  canAttend: boolean
  onAddInterview: (applicationId: string) => void
  onRemoveInterview: (applicationId: string) => void
}

export function InterviewCalendar({
  period,
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
      period={period}
      className={SELECTION_CLASSES}
      plugins={[interactionPlugin]}
      slotEventOverlap={false}
      events={events}
      slots={interviews}
      getSlotId={(interview) => interview.applicationId}
      fieldSelector={POPUP_TARGET_SELECTOR}
      renderSlot={(interview, { timeText, isActive, popupSide }) => (
        <InterviewSlot
          interview={interview}
          timeText={timeText}
          isActive={isActive}
          popupSide={popupSide}
          isAdded={addedInterviewIds.has(interview.applicationId)}
          canAttend={canAttend}
          onAdd={() => onAddInterview(interview.applicationId)}
          onRemove={() => onRemoveInterview(interview.applicationId)}
          onOpenApplicant={() => router.push(`/admin/opptak/${id}/sokere/${groupId}/${interview.applicationId}`)}
        />
      )}
    />
  )
}
