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
  type SlotColors,
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

const mirrorVariables = (colors: SlotColors) => ({
  "--slot-mirror-background": colors.surface,
  "--slot-mirror-border": colors.border,
  "--slot-mirror-text": colors.text,
})

function SlotSummary({ slot }: { slot: AvailabilitySlot }) {
  const details = [
    { icon: IconMapPin, value: slot.room },
    { icon: IconLink, value: slot.link },
  ].filter(({ value }) => value !== "")

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
        <span className="truncate font-semibold">Ugyldig rom</span>
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
          <span className="truncate font-semibold">{value}</span>
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
        <SlotRemoveButton label="Fjern intervjutid" onClick={onRemove} />
      </div>

      {isActive ? (
        <MazemapRoom
          room={slot.room}
          link={slot.link}
          onSelect={(room, link) => {
            onUpdate({ room, link })
            onCollapse()
          }}
          onRoomChange={(room) => onUpdate({ room, link: "" })}
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
  const sectionRef = useRef<HTMLElement>(null)
  const pendingSlotIdRef = useRef<string | null>(null)

  const slotLanes = useMemo(() => findSlotLanes(selected), [selected])
  const slotColorIndexes = useMemo(() => findSlotColorIndexes(selected), [selected])

  const events = useMemo(
    () =>
      selected.map((slot) => ({
        id: slot.id,
        start: slot.start,
        end: slot.end,
        ...toSlotEventColors(getSlotColors(slotColorIndexes.get(slot.id) ?? 0)),
      })),
    [selected, slotColorIndexes]
  )

  const toInterval = (id: string, start: Date, end: Date) => ({
    id,
    start: start.toISOString(),
    end: end.toISOString(),
  })

  const fitsLanes = (interval: SlotInterval) => {
    if (!exceedsLaneLimit(selected, interval, MAXIMUM_OVERLAPPING_SLOTS)) {
      return true
    }

    notifyTooManyOverlappingInterviewBlocks(MAXIMUM_OVERLAPPING_SLOTS)
    return false
  }

  const updateSlot = (id: string, patch: Partial<AvailabilitySlot>) =>
    onChange(selected.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)))

  return (
    <SlotCalendar
      heading="Intervjutider"
      initialDate={initialDate}
      sectionRef={sectionRef}
      className={SELECTION_CLASSES}
      style={mirrorVariables(DEFAULT_COLORS) as CSSProperties}
      plugins={[interactionPlugin]}
      snapDuration={{ minutes: GRID_ROW_MINUTES }}
      selectAllow={({ start, end }) => {
        if (!isSameDay(start, subMilliseconds(end, 1))) {
          return false
        }

        pendingSlotIdRef.current ??= crypto.randomUUID()
        const colors = getSlotColors(findIntervalColorIndex(selected, toInterval(pendingSlotIdRef.current, start, end)))

        for (const [name, value] of Object.entries(mirrorVariables(colors))) {
          sectionRef.current?.style.setProperty(name, value)
        }

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
      select={({ start, end, view }) => {
        view.calendar.unselect()

        if (differenceInMinutes(end, start) < COMMITTEE_APPLICATION_INTERVIEW_DURATION_MINUTES[interviewDuration]) {
          notifyInterviewBlockTooShort()
          return
        }

        const interval = toInterval(pendingSlotIdRef.current ?? crypto.randomUUID(), start, end)

        if (fitsLanes(interval)) {
          pendingSlotIdRef.current = null
          onChange([...selected, { ...interval, room: "", link: "" }])
        }
      }}
      eventChange={({ event, revert }) => {
        if (event.start === null || event.end === null) {
          return
        }

        const { id, start, end } = toInterval(event.id, event.start, event.end)

        if (fitsLanes({ id, start, end })) {
          updateSlot(id, { start, end })
        } else {
          revert()
        }
      }}
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
          onUpdate={(patch) => updateSlot(slot.id, patch)}
          onCollapse={collapse}
          onRemove={() => onChange(selected.filter((item) => item.id !== slot.id))}
        />
      )}
    />
  )
}
