"use client"

import { Button, cn, Text, Title } from "@dotkomonline/ui"
import type { CalendarOptions, EventContentArg } from "@fullcalendar/core"
import nbLocale from "@fullcalendar/core/locales/nb"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { IconMapPin, IconX } from "@tabler/icons-react"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import {
  type CSSProperties,
  type DragEvent,
  type ReactNode,
  type Ref,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react"
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

export const LANE_TRANSITION_CLASSES = cn(
  "[&_.fc-timegrid-event-harness]:transition-[left]!",
  "[&_.fc-timegrid-event-harness]:duration-150!",
  "[&_.fc-timegrid-event-harness]:ease-out!"
)

function matchesSelector(target: EventTarget | null, selector: string): boolean {
  return target instanceof Element && target.closest(selector) !== null
}

export function useExpandedSlot(exemptSelector: string) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (expandedId === null) {
      return
    }

    const collapseOnOutsideClick = (event: PointerEvent) => {
      if (matchesSelector(event.target, exemptSelector) || matchesSelector(event.target, ACTIVE_SLOT_SELECTOR)) {
        return
      }

      setExpandedId(null)
    }

    document.addEventListener("pointerdown", collapseOnOutsideClick)

    return () => {
      document.removeEventListener("pointerdown", collapseOnOutsideClick)
    }
  }, [expandedId, exemptSelector])

  const toggleExpanded = useCallback((slotId: string) => {
    setExpandedId((current) => (current === slotId ? null : slotId))
  }, [])

  return { expandedId, setExpandedId, toggleExpanded }
}

function stopPropagation(event: SyntheticEvent) {
  event.stopPropagation()
}

type SlotRemoveButtonProps = {
  label: string
  className?: string
  stopsPropagation?: boolean
  onClick: () => void
}

export function SlotRemoveButton({ label, className, stopsPropagation = false, onClick }: SlotRemoveButtonProps) {
  return (
    <Button
      variant="unstyled"
      aria-label={label}
      title={label}
      className={cn(
        "flex shrink-0 cursor-pointer items-center justify-center rounded-md",
        "opacity-60 transition-[opacity,background-color] hover:bg-current/10 hover:opacity-100",
        className
      )}
      onPointerDown={stopsPropagation ? stopPropagation : undefined}
      onMouseDown={stopsPropagation ? stopPropagation : undefined}
      onClick={onClick}
    >
      <IconX className="size-3.5" />
    </Button>
  )
}

export function SlotAccent({ color }: { color: string }) {
  return (
    <span aria-hidden className="absolute inset-y-1 left-1 w-[3px] rounded-full" style={{ backgroundColor: color }} />
  )
}

type CalendarSlotProps = {
  isActive: boolean
  level?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export function CalendarSlot({ isActive, level, className, style, children }: CalendarSlotProps) {
  return (
    <div
      data-slot-active={isActive ? "true" : undefined}
      data-slot-level={level}
      className={cn(className, isActive && "slot-active")}
      style={style}
    >
      {children}
    </div>
  )
}

type CalendarEventBodyProps = {
  timeText: string
  title: string
  locationName?: string
  titleIcon?: ReactNode
  accentColor?: string
  trailing?: ReactNode
}

export function CalendarEventBody({
  timeText,
  title,
  locationName,
  titleIcon,
  accentColor,
  trailing,
}: CalendarEventBodyProps) {
  return (
    <div className="relative flex h-full w-full flex-col gap-1 overflow-hidden py-1.5 pl-3 pr-1.5">
      {accentColor !== undefined && <SlotAccent color={accentColor} />}

      <div className="flex shrink-0 items-center justify-between gap-2">
        <Text element="span" className="truncate text-xs font-medium leading-none">
          {timeText}
        </Text>
        {locationName !== undefined && (
          <Text element="span" className="flex min-w-0 items-center gap-1 text-xs leading-none">
            <IconMapPin className="size-3.5 shrink-0 opacity-45" stroke={2} />
            <Text element="span" className="truncate">
              {locationName}
            </Text>
          </Text>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2">
        <Text element="span" className="flex min-w-0 items-center gap-1 text-xs font-semibold leading-none">
          {titleIcon}
          <Text element="span" className="truncate">
            {title}
          </Text>
        </Text>
        {trailing}
      </div>
    </div>
  )
}

function preventNativeDrag(event: DragEvent<HTMLElement>) {
  event.preventDefault()
}

type SlotPopupProps = {
  label: string
  placement?: "side" | "bottom"
  anchorsToBottom?: boolean
  opensToLeft?: boolean
  alignsToEnd?: boolean
  children: ReactNode
}

export function SlotPopup({
  label,
  placement = "side",
  anchorsToBottom = false,
  opensToLeft = false,
  alignsToEnd = false,
  children,
}: SlotPopupProps) {
  const opensBelow = placement === "bottom"

  const positionClasses = opensBelow
    ? `top-[calc(100%+8px)] ${alignsToEnd ? "right-0" : "left-0"}`
    : `${anchorsToBottom ? "bottom-0" : "top-0"} ${opensToLeft ? "right-[calc(100%+8px)]" : "left-[calc(100%+8px)]"}`

  const arrowClasses = opensBelow
    ? `top-[calc(100%+2px)] ${alignsToEnd ? "right-8" : "left-8"} border-r-0 border-b-0`
    : `top-1/2 -translate-y-1/2 ${
        opensToLeft ? "right-[calc(100%+2px)] border-b-0 border-l-0" : "left-[calc(100%+2px)] border-r-0 border-t-0"
      }`

  return (
    <>
      <div
        role="dialog"
        aria-label={label}
        draggable={false}
        onDragStart={preventNativeDrag}
        className={cn(
          "slot-popup absolute z-50 flex w-[150%] max-w-[calc(100vw-2rem)] cursor-auto select-text flex-col gap-2",
          "rounded-lg border p-2.5 text-popover-foreground shadow-popover",
          POPUP_SURFACE_CLASSES,
          positionClasses
        )}
      >
        {children}
      </div>

      <span
        aria-hidden
        className={cn("slot-popup absolute z-50 size-3 rotate-45 border", POPUP_SURFACE_CLASSES, arrowClasses)}
      />
    </>
  )
}

function renderDayHeader(date: Date) {
  const weekday = formatDate(date, "EEE", { locale: nb }).replace(".", "")

  return (
    <div className="flex flex-col items-center gap-0.5 py-2 font-normal">
      <Text element="span" className="text-xs uppercase tracking-wider text-muted-foreground">
        {weekday}
      </Text>
      <Text element="span" className="text-lg text-foreground">
        {formatDate(date, "d")}
      </Text>
    </div>
  )
}

const BASE_CALENDAR_OPTIONS = {
  initialView: "timeGridWeek",
  locale: nbLocale,
  headerToolbar: false,
  weekends: false,
  allDaySlot: false,
  height: "auto",
  slotMinTime: DAY_START_TIME,
  slotMaxTime: DAY_END_TIME,
  slotDuration: { minutes: GRID_ROW_MINUTES },
  slotLabelInterval: "01:00",
  slotLabelFormat: TIME_FORMAT,
  eventTimeFormat: TIME_FORMAT,
} as const satisfies CalendarOptions

const BASE_CALENDAR_VARIABLES = {
  "--fc-today-bg-color": "transparent",
  "--fc-event-selected-overlay-color": "transparent",
  "--fc-page-bg-color": "var(--background)",
  "--fc-border-color": "var(--border)",
  "--fc-neutral-bg-color": "var(--muted)",
  "--fc-neutral-text-color": "var(--muted-foreground)",
  "--fc-highlight-color": "color-mix(in oklab, var(--ring) 20%, transparent)",
} as CSSProperties

type BaseCalendarProps = CalendarOptions & {
  heading: string
  initialDate: Date
  className?: string
  style?: CSSProperties
  sectionRef?: Ref<HTMLElement>
}

function BaseCalendar({ heading, className, style, sectionRef, plugins = [], ...calendarOptions }: BaseCalendarProps) {
  const headingId = useId()

  return (
    <section
      ref={sectionRef}
      aria-labelledby={headingId}
      className={cn("[&_.fc-timegrid-event_.fc-event-main]:p-0!", className)}
      style={{ ...BASE_CALENDAR_VARIABLES, ...style }}
    >
      <Title element="h2" id={headingId} className="sr-only">
        {heading}
      </Title>

      <FullCalendar
        plugins={[timeGridPlugin, ...plugins]}
        {...BASE_CALENDAR_OPTIONS}
        dayHeaderContent={(arg) => renderDayHeader(arg.date)}
        {...calendarOptions}
      />
    </section>
  )
}

type SlotRenderContext = {
  timeText: string
  isActive: boolean
  collapse: () => void
}

type SlotCalendarProps<TSlot> = Omit<BaseCalendarProps, "eventClick" | "eventContent"> & {
  slots: TSlot[]
  getSlotId: (slot: TSlot) => string
  fieldSelector: string
  renderSlot: (slot: TSlot, context: SlotRenderContext) => ReactNode
}

export function SlotCalendar<TSlot>({
  slots,
  getSlotId,
  fieldSelector,
  renderSlot,
  ...calendarOptions
}: SlotCalendarProps<TSlot>) {
  const { expandedId, setExpandedId, toggleExpanded } = useExpandedSlot(fieldSelector)

  const renderEvent = (arg: EventContentArg) => {
    const slot = slots.find((candidate) => getSlotId(candidate) === arg.event.id)

    if (slot === undefined) {
      return null
    }

    return renderSlot(slot, {
      timeText: arg.timeText,
      isActive: arg.event.id === expandedId,
      collapse: () => setExpandedId(null),
    })
  }

  return (
    <BaseCalendar
      {...calendarOptions}
      eventClick={(arg) => {
        if (!matchesSelector(arg.jsEvent.target, fieldSelector)) {
          toggleExpanded(arg.event.id)
        }
      }}
      eventContent={renderEvent}
    />
  )
}
