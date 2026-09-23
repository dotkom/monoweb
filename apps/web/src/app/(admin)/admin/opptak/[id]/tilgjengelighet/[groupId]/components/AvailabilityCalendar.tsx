"use client"

import {
  ACTIVE_SLOT_CLASSES,
  CalendarSlot,
  LANE_TRANSITION_CLASSES,
  SlotAccent,
  SlotCalendar,
  SLOT_LANE_CLASSES,
  SlotRemoveButton,
} from "../../../../components/Calendar/Calendar"
import {
  exceedsLaneLimit,
  findIntervalColorIndex,
  findSlotColorIndexes,
  findSlotLanes,
  getSlotColors,
  getSlotPanel,
  GRID_ROW_MINUTES,
  type SlotInterval,
  toSlotEventColors,
} from "../../../../components/Calendar/slot-layout"
import { notifyInterviewBlockTooShort, notifyTooManyOverlappingInterviewBlocks } from "../../../../mutations"
import {
  COMMITTEE_APPLICATION_INTERVIEW_DURATION_MINUTES,
  type CommitteeApplicationInterviewDuration,
} from "@dotkomonline/rpc/committee-application"
import { hasValidMazemapRoom } from "@dotkomonline/rpc/mazemap"
import { cn, Text } from "@dotkomonline/ui"
import type { DateSelectArg, EventChangeArg, EventInput } from "@fullcalendar/core"
import interactionPlugin from "@fullcalendar/interaction"
import { IconAlertTriangle, IconLink, IconMapPin } from "@tabler/icons-react"
import { differenceInMinutes, isSameDay, subMilliseconds } from "date-fns"
import { type CSSProperties, useMemo, useRef } from "react"
import { MazemapRoom } from "./mazemap/MazemapRoom"

export type AvailabilitySlot = SlotInterval & {
  room: string
  link: string
}

const MAXIMUM_OVERLAPPING_SLOTS = 4
const MINIMUM_INLINE_FIELD_ROWS = 6

const DEFAULT_COLORS = getSlotColors(0)

const SLOT_FIELD_SELECTOR = "input, label, button, .slot-popup, [data-slot='mazemap-room']"

const MIRROR = "[&_.fc-event-mirror:not(.fc-event-dragging):not(.fc-event-resizing)]"

const SELECTION_CLASSES = cn(
  `${MIRROR}:border-(--slot-mirror-background)! ${MIRROR}:bg-(--slot-mirror-background)!`,
  `${MIRROR}:text-(--slot-mirror-text)! ${MIRROR}:shadow-[inset_3px_0_0_var(--slot-mirror-border)]!`,
  SLOT_LANE_CLASSES,
  LANE_TRANSITION_CLASSES,
  ACTIVE_SLOT_CLASSES,
  "[&_.fc-timegrid-event]:cursor-pointer! [&_.fc-timegrid-event]:transition-shadow! [&_.fc-timegrid-event-harness:has(.slot-active)]:mr-0!"
)

function SlotSummary({ slot }: { slot: AvailabilitySlot }) {
  const details = [
    { icon: IconMapPin, value: slot.room },
    { icon: IconLink, value: slot.link },
  ].filter((detail) => detail.value !== "")

  if (details.length === 0) {
    return (
      <Text element="span" className="shrink-0 truncate text-xs italic leading-none opacity-55">
        Klikk for å fylle inn
      </Text>
    )
  }

  if (!hasValidMazemapRoom(slot.room, slot.link)) {
    return (
      <Text element="span" className="flex shrink-0 items-center gap-1 text-xs leading-none text-destructive">
        <IconAlertTriangle className="size-3.5 shrink-0" stroke={2} />
        <Text element="span" className="truncate font-semibold">
          Ugyldig rom
        </Text>
      </Text>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-2 text-xs leading-none">
      {details.map(({ icon: DetailIcon, value }, index) => (
        <Text
          key={value}
          element="span"
          className={cn(
            "flex min-w-0 items-center gap-1",
            index === details.length - 1 ? "flex-1" : "max-w-1/2 shrink"
          )}
        >
          <DetailIcon className="size-3.5 shrink-0 opacity-45" stroke={2} />
          <Text element="span" className="truncate font-semibold">
            {value}
          </Text>
        </Text>
      ))}
    </div>
  )
}

type SlotSelectionProps = {
  slot: AvailabilitySlot
  timeText: string
  isActive: boolean
  laneIndex: number
  colorIndex: number
  onUpdate: (patch: Partial<AvailabilitySlot>) => void
  onCollapse: () => void
  onRemove: () => void
}

function SlotSelection({
  slot,
  timeText,
  isActive,
  laneIndex,
  colorIndex,
  onUpdate,
  onCollapse,
  onRemove,
}: SlotSelectionProps) {
  const colors = getSlotColors(colorIndex)
  const { anchorsToBottom, heightPercentage } = getSlotPanel(slot.start, slot.end, MINIMUM_INLINE_FIELD_ROWS)

  return (
    <CalendarSlot
      isActive={isActive}
      level={isActive ? 0 : laneIndex}
      className={cn(
        "flex flex-col gap-1.5 overflow-hidden rounded-[4px] py-1.5 pl-3 pr-1.5 transition-shadow",
        isActive
          ? cn("absolute -inset-x-px z-30 shadow-lg", anchorsToBottom ? "-bottom-px" : "-top-px")
          : "relative h-full w-full"
      )}
      style={
        isActive ? { minHeight: `calc(${heightPercentage}% + 2px)`, backgroundColor: colors.background } : undefined
      }
    >
      <SlotAccent color={colors.border} />

      <div className="flex shrink-0 items-center justify-between gap-1">
        <Text element="span" className="min-w-0 truncate text-xs font-medium leading-none">
          {timeText}
        </Text>

        <SlotRemoveButton
          label="Fjern intervjutid"
          className="-my-1 -mr-1 size-6"
          stopsPropagation
          onClick={onRemove}
        />
      </div>

      {isActive ? (
        <MazemapRoom
          room={slot.room}
          link={slot.link}
          onSelect={(room, link) => {
            onUpdate({ room, link })
            onCollapse()
          }}
          onRoomChange={(room) => {
            onUpdate({ room, link: "" })
          }}
        />
      ) : (
        <SlotSummary slot={slot} />
      )}
    </CalendarSlot>
  )
}

type AvailabilityCalendarProps = {
  initialDate: Date
  interviewDuration: CommitteeApplicationInterviewDuration
  selected: AvailabilitySlot[]
  onChange: (selected: AvailabilitySlot[]) => void
}

export function AvailabilityCalendar({
  initialDate,
  interviewDuration,
  selected,
  onChange,
}: AvailabilityCalendarProps) {
  const interviewMinutes = COMMITTEE_APPLICATION_INTERVIEW_DURATION_MINUTES[interviewDuration]

  const sectionRef = useRef<HTMLElement>(null)
  const pendingSlotIdRef = useRef<string | null>(null)

  const slotLanes = useMemo(() => findSlotLanes(selected), [selected])
  const slotColorIndexes = useMemo(() => findSlotColorIndexes(selected), [selected])

  const events: EventInput[] = useMemo(
    () =>
      selected.map((slot) => ({
        id: slot.id,
        start: slot.start,
        end: slot.end,
        ...toSlotEventColors(getSlotColors(slotColorIndexes.get(slot.id) ?? 0)),
      })),
    [selected, slotColorIndexes]
  )

  const previewMirrorColors = (start: Date, end: Date) => {
    pendingSlotIdRef.current ??= crypto.randomUUID()

    const colors = getSlotColors(
      findIntervalColorIndex(selected, {
        id: pendingSlotIdRef.current,
        start: start.toISOString(),
        end: end.toISOString(),
      })
    )

    sectionRef.current?.style.setProperty("--slot-mirror-background", colors.surface)
    sectionRef.current?.style.setProperty("--slot-mirror-border", colors.border)
    sectionRef.current?.style.setProperty("--slot-mirror-text", colors.text)
  }

  const handleSelect = (arg: DateSelectArg) => {
    arg.view.calendar.unselect()

    if (differenceInMinutes(arg.end, arg.start) < interviewMinutes) {
      notifyInterviewBlockTooShort()
      return
    }

    const id = pendingSlotIdRef.current ?? crypto.randomUUID()
    const interval = { id, start: arg.start.toISOString(), end: arg.end.toISOString() }

    if (exceedsLaneLimit(selected, interval, MAXIMUM_OVERLAPPING_SLOTS)) {
      notifyTooManyOverlappingInterviewBlocks(MAXIMUM_OVERLAPPING_SLOTS)
      return
    }

    pendingSlotIdRef.current = null

    onChange([...selected, { ...interval, room: "", link: "" }])
  }

  const handleEventChange = (arg: EventChangeArg) => {
    const { id, start, end } = arg.event

    if (start === null || end === null) {
      return
    }

    const interval = { id, start: start.toISOString(), end: end.toISOString() }

    if (exceedsLaneLimit(selected, interval, MAXIMUM_OVERLAPPING_SLOTS)) {
      notifyTooManyOverlappingInterviewBlocks(MAXIMUM_OVERLAPPING_SLOTS)
      arg.revert()
      return
    }

    onChange(selected.map((slot) => (slot.id === id ? { ...slot, start: interval.start, end: interval.end } : slot)))
  }

  return (
    <SlotCalendar
      heading="Intervjutider"
      initialDate={initialDate}
      sectionRef={sectionRef}
      className={SELECTION_CLASSES}
      style={
        {
          "--slot-mirror-background": DEFAULT_COLORS.surface,
          "--slot-mirror-border": DEFAULT_COLORS.border,
          "--slot-mirror-text": DEFAULT_COLORS.text,
        } as CSSProperties
      }
      plugins={[interactionPlugin]}
      snapDuration={{ minutes: GRID_ROW_MINUTES }}
      selectAllow={(span) => {
        if (!isSameDay(span.start, subMilliseconds(span.end, 1))) {
          return false
        }

        previewMirrorColors(span.start, span.end)

        return true
      }}
      slotEventOverlap
      selectable
      selectMirror
      editable
      eventResizableFromStart
      eventBackgroundColor={DEFAULT_COLORS.surface}
      eventBorderColor={DEFAULT_COLORS.surface}
      eventTextColor={DEFAULT_COLORS.text}
      events={events}
      select={handleSelect}
      eventChange={handleEventChange}
      slots={selected}
      getSlotId={(slot) => slot.id}
      fieldSelector={SLOT_FIELD_SELECTOR}
      renderSlot={(slot, { timeText, isActive, collapse }) => (
        <SlotSelection
          slot={slot}
          timeText={timeText}
          isActive={isActive}
          laneIndex={slotLanes.get(slot.id) ?? 0}
          colorIndex={slotColorIndexes.get(slot.id) ?? 0}
          onUpdate={(patch) => {
            onChange(selected.map((item) => (item.id === slot.id ? { ...item, ...patch } : item)))
          }}
          onCollapse={collapse}
          onRemove={() => {
            onChange(selected.filter((item) => item.id !== slot.id))
          }}
        />
      )}
    />
  )
}
