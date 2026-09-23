"use client"

import { Button, cn, Text, Title } from "@dotkomonline/ui"
import type { CalendarOptions } from "@fullcalendar/core"
import nbLocale from "@fullcalendar/core/locales/nb"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { IconMapPin, IconX } from "@tabler/icons-react"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import { type CSSProperties, type ReactNode, type Ref, useEffect, useId, useState } from "react"
import "./calendar-theme.css"
import { DAY_END_TIME, DAY_START_TIME, GRID_ROW_MINUTES } from "./slot-layout"

const TIME_FORMAT = { hour: "2-digit", minute: "2-digit", hour12: false } as const
const ACTIVE_SLOT_SELECTOR = "[data-slot-active='true']"
const POPUP_SURFACE_CLASSES = "border-border bg-popover"

export const SLOT_LANE_CLASSES = cn(
  "[&_.fc-timegrid-event-harness]:right-0! [&_.fc-timegrid-event-harness]:mr-0!",
  "[&_.fc-timegrid-event-harness:has([data-slot-level='0'])]:left-0!",
  "[&_.fc-timegrid-event-harness:has([data-slot-level='1'])]:left-[9%]!",
  "[&_.fc-timegrid-event-harness:has([data-slot-level='2'])]:left-[18%]!",
  "[&_.fc-timegrid-event-harness:has([data-slot-level='3'])]:left-[27%]!",
  "[&_.fc-timegrid-event-harness:has([data-slot-level='4'])]:left-[36%]!"
)

export const ACTIVE_SLOT_CLASSES = cn(
  "[&_.fc-timegrid-event-harness:has(.slot-active)]:z-30!",
  "[&_.fc-timegrid-event-harness:has(.slot-active)]:overflow-visible!",
  "[&_.fc-timegrid-event:has(.slot-active)]:overflow-visible!",
  "[&_.fc-timegrid-event_.fc-event-main]:relative!"
)

export const LANE_TRANSITION_CLASSES =
  "[&_.fc-timegrid-event-harness]:transition-[left]! [&_.fc-timegrid-event-harness]:duration-150! [&_.fc-timegrid-event-harness]:ease-out!"

const CALENDAR_VARIABLES = {
  "--fc-today-bg-color": "transparent",
  "--fc-event-selected-overlay-color": "transparent",
  "--fc-page-bg-color": "var(--background)",
  "--fc-border-color": "var(--border)",
  "--fc-neutral-bg-color": "var(--muted)",
  "--fc-neutral-text-color": "var(--muted-foreground)",
  "--fc-highlight-color": "color-mix(in oklab, var(--ring) 20%, transparent)",
} as CSSProperties

const matches = (target: EventTarget | null, selector: string) =>
  target instanceof Element && target.closest(selector) !== null

export const SlotRemoveButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <Button
    variant="unstyled"
    aria-label={label}
    title={label}
    className="-my-1 -mr-1 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md opacity-60 transition-[opacity,background-color] hover:bg-current/10 hover:opacity-100"
    onPointerDown={(event) => event.stopPropagation()}
    onMouseDown={(event) => event.stopPropagation()}
    onClick={onClick}
  >
    <IconX className="size-3.5" />
  </Button>
)

export const SlotAccent = ({ color }: { color: string }) => (
  <span aria-hidden className="absolute inset-y-1 left-1 w-[3px] rounded-full" style={{ backgroundColor: color }} />
)

export const CalendarSlot = ({
  isActive,
  level,
  className,
  style,
  children,
}: {
  isActive: boolean
  level?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}) => (
  <div
    data-slot-active={isActive || undefined}
    data-slot-level={level}
    className={cn(className, isActive && "slot-active")}
    style={style}
  >
    {children}
  </div>
)

export const CalendarEventBody = ({
  timeText,
  title,
  locationName,
  titleIcon,
  accentColor,
  trailing,
}: {
  timeText: string
  title: string
  locationName: string
  titleIcon: ReactNode
  accentColor: string
  trailing: ReactNode
}) => (
  <div className="relative flex h-full w-full flex-col gap-1 overflow-hidden py-1.5 pl-3 pr-1.5">
    <SlotAccent color={accentColor} />
    <div className="flex shrink-0 items-center justify-between gap-2">
      <Text element="span" className="truncate text-xs font-medium leading-none">
        {timeText}
      </Text>
      <Text element="span" className="flex min-w-0 items-center gap-1 text-xs leading-none">
        <IconMapPin className="size-3.5 shrink-0 opacity-45" stroke={2} />
        <span className="truncate">{locationName}</span>
      </Text>
    </div>
    <div className="flex shrink-0 items-center justify-between gap-2">
      <Text element="span" className="flex min-w-0 items-center gap-1 text-xs font-semibold leading-none">
        {titleIcon}
        <span className="truncate">{title}</span>
      </Text>
      {trailing}
    </div>
  </div>
)

export const SlotPopup = ({
  label,
  anchorsToBottom = false,
  opensToLeft = false,
  children,
}: {
  label: string
  anchorsToBottom?: boolean
  opensToLeft?: boolean
  children: ReactNode
}) => (
  <>
    <div
      role="dialog"
      aria-label={label}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      className={cn(
        "slot-popup absolute z-50 flex w-[150%] max-w-[calc(100vw-2rem)] cursor-auto select-text flex-col gap-2 rounded-lg border p-2.5 text-popover-foreground shadow-popover",
        POPUP_SURFACE_CLASSES,
        anchorsToBottom ? "bottom-0" : "top-0",
        opensToLeft ? "right-[calc(100%+8px)]" : "left-[calc(100%+8px)]"
      )}
    >
      {children}
    </div>
    <span
      aria-hidden
      className={cn(
        "slot-popup absolute top-1/2 z-50 size-3 -translate-y-1/2 rotate-45 border",
        POPUP_SURFACE_CLASSES,
        opensToLeft ? "right-[calc(100%+2px)] border-b-0 border-l-0" : "left-[calc(100%+2px)] border-r-0 border-t-0"
      )}
    />
  </>
)

type SlotCalendarProps<TSlot> = Omit<CalendarOptions, "eventClick" | "eventContent"> & {
  heading: string
  initialDate: Date
  className?: string
  style?: CSSProperties
  sectionRef?: Ref<HTMLElement>
  slots: TSlot[]
  getSlotId: (slot: TSlot) => string
  fieldSelector: string
  renderSlot: (slot: TSlot, context: { timeText: string; isActive: boolean; collapse: () => void }) => ReactNode
}

export function SlotCalendar<TSlot>({
  heading,
  className,
  style,
  sectionRef,
  plugins = [],
  slots,
  getSlotId,
  fieldSelector,
  renderSlot,
  ...calendarOptions
}: SlotCalendarProps<TSlot>) {
  const headingId = useId()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (expandedId === null) {
      return
    }

    const collapseOnOutsideClick = (event: PointerEvent) => {
      if (!matches(event.target, fieldSelector) && !matches(event.target, ACTIVE_SLOT_SELECTOR)) {
        setExpandedId(null)
      }
    }

    document.addEventListener("pointerdown", collapseOnOutsideClick)
    return () => document.removeEventListener("pointerdown", collapseOnOutsideClick)
  }, [expandedId, fieldSelector])

  return (
    <section
      ref={sectionRef}
      aria-labelledby={headingId}
      className={cn("[&_.fc-timegrid-event_.fc-event-main]:p-0!", className)}
      style={{ ...CALENDAR_VARIABLES, ...style }}
    >
      <Title element="h2" id={headingId} className="sr-only">
        {heading}
      </Title>

      <FullCalendar
        plugins={[timeGridPlugin, ...plugins]}
        initialView="timeGridWeek"
        locale={nbLocale}
        headerToolbar={false}
        weekends={false}
        allDaySlot={false}
        height="auto"
        slotMinTime={DAY_START_TIME}
        slotMaxTime={DAY_END_TIME}
        slotDuration={{ minutes: GRID_ROW_MINUTES }}
        slotLabelInterval="01:00"
        slotLabelFormat={TIME_FORMAT}
        eventTimeFormat={TIME_FORMAT}
        dayHeaderContent={({ date }) => (
          <div className="flex flex-col items-center gap-0.5 py-2 font-normal">
            <Text element="span" className="text-xs uppercase tracking-wider text-muted-foreground">
              {formatDate(date, "EEE", { locale: nb }).replace(".", "")}
            </Text>
            <Text element="span" className="text-lg text-foreground">
              {formatDate(date, "d")}
            </Text>
          </div>
        )}
        {...calendarOptions}
        eventClick={({ jsEvent, event }) => {
          if (!matches(jsEvent.target, fieldSelector)) {
            setExpandedId((current) => (current === event.id ? null : event.id))
          }
        }}
        eventContent={({ event, timeText }) => {
          const slot = slots.find((candidate) => getSlotId(candidate) === event.id)

          return slot === undefined
            ? null
            : renderSlot(slot, { timeText, isActive: event.id === expandedId, collapse: () => setExpandedId(null) })
        }}
      />
    </section>
  )
}
