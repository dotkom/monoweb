"use client"

import { ConfirmModal } from "@admin/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import {
  ACTIVE_SLOT_CLASSES,
  CalendarEventBody,
  CalendarSlot,
  SlotCalendar,
  SlotPopup,
  useExpandedSlot,
} from "../../../../components/Calendar/Calendar"
import {
  getSlotPanel,
  INTERVIEW_SLOT_COLORS,
  REQUIRED_ATTENDEES,
  type SlotColors,
  toSlotEventColors,
} from "../../../../components/Calendar/slot-layout"
import { CopyableLink, InterviewAttendee } from "../../../../components/Cells"
import { CopyButton } from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import type { CommitteeApplicationMatchedInterview } from "@dotkomonline/rpc/committee-application"
import { Button, cn, Text } from "@dotkomonline/ui"
import type { EventInput } from "@fullcalendar/core"
import interactionPlugin from "@fullcalendar/interaction"
import {
  IconArrowUpRight,
  IconCheck,
  IconMail,
  IconMapPin,
  IconPhone,
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

function getInterviewColors(isAdded: boolean, attendeeCount: number): SlotColors {
  return isAdded || attendeeCount >= REQUIRED_ATTENDEES ? INTERVIEW_SLOT_COLORS.own : INTERVIEW_SLOT_COLORS.understaffed
}

export function useExpandedInterview() {
  return useExpandedSlot(POPUP_TARGET_SELECTOR)
}

type InterviewSlotProps = {
  interview: CommitteeApplicationMatchedInterview
  timeText: string
  isActive: boolean
  isAdded: boolean
  canAttend: boolean
  placement?: "side" | "bottom"
  opensToLeft?: boolean
  alignsToEnd?: boolean
  onAdd?: () => void
  onRemove: () => void
  onOpenApplicant: () => void
}

export function InterviewSlot({
  interview,
  timeText,
  isActive,
  isAdded,
  canAttend,
  placement = "side",
  opensToLeft = false,
  alignsToEnd = false,
  onAdd,
  onRemove,
  onOpenApplicant,
}: InterviewSlotProps) {
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false)

  const attendees = interview.attendees
  const colors = getInterviewColors(isAdded, attendees.length)

  return (
    <CalendarSlot isActive={isActive} className="relative flex h-full w-full flex-col rounded-[4px]">
      <CalendarEventBody
        timeText={timeText}
        title={interview.name}
        locationName={interview.locationName}
        titleIcon={<IconUser className="size-3.5 shrink-0 opacity-45" stroke={2} />}
        accentColor={colors.border}
        trailing={
          <Text
            element="span"
            className="flex shrink-0 items-center gap-1 text-xs leading-none"
            title={`${attendees.length === 0 ? "Ingen" : attendees.length} deltar i intervjuet`}
          >
            <IconUsers className="size-3.5 shrink-0 opacity-45" stroke={2} />
            {attendees.length === 0 ? "ingen" : attendees.length}
          </Text>
        }
      />

      {isActive && (
        <SlotPopup
          label={`Detaljer for intervju med ${interview.name}`}
          placement={placement}
          anchorsToBottom={getSlotPanel(interview.startsAt, interview.endsAt, EXPANDED_ROWS).anchorsToBottom}
          opensToLeft={opensToLeft}
          alignsToEnd={alignsToEnd}
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

            {interview.locationUrl !== null && <CopyableLink url={interview.locationUrl} className="flex-1 text-xs" />}
          </div>

          {[
            { icon: IconMail, value: interview.email, emptyLabel: "Ingen e-post" },
            { icon: IconPhone, value: interview.phone, emptyLabel: "Ingen telefonnummer" },
          ].map(({ icon: ContactIcon, value, emptyLabel }) => (
            <div key={emptyLabel} className="flex items-center gap-1.5">
              <ContactIcon className="size-3.5 shrink-0 opacity-45" stroke={2} />
              <Text
                element="span"
                className={cn("min-w-0 flex-1 truncate text-xs", value === null && "italic opacity-55")}
              >
                {value ?? emptyLabel}
              </Text>
              {value !== null && <CopyButton value={value} iconOnly />}
            </div>
          ))}

          <div className="mt-4 flex flex-col gap-1.5">
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

          <div className="mt-4 flex flex-col items-start gap-1.5">
            {canAttend && (
              <div className="flex items-center gap-1.5">
                {onAdd !== undefined && (
                  <Button
                    variant="default"
                    size="sm"
                    icon={isAdded ? <IconCheck /> : <IconUserPlus />}
                    disabled={isAdded}
                    onClick={onAdd}
                  >
                    {isAdded ? "Deltar" : "Delta i intervjuet"}
                  </Button>
                )}

                {isAdded && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setIsRemoveConfirmOpen(true)
                    }}
                  >
                    Meld meg av
                  </Button>
                )}
              </div>
            )}

            <Button variant="default" size="sm" iconRight={<IconArrowUpRight />} onClick={onOpenApplicant}>
              Søkeropplysninger
            </Button>
          </div>

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

  const events: EventInput[] = useMemo(
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
          opensToLeft={getDay(interview.startsAt) === LAST_WEEKDAY}
          onAdd={() => {
            onAddInterview(interview.applicationId)
          }}
          onRemove={() => {
            onRemoveInterview(interview.applicationId)
          }}
          onOpenApplicant={() => {
            router.push(`/admin/opptak/${id}/opplysninger/${groupId}/${interview.applicationId}`)
          }}
        />
      )}
    />
  )
}
