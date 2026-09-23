export const DAY_START_TIME = "09:00"
export const DAY_END_TIME = "17:00"
export const GRID_ROW_MINUTES = 10

export type SlotColors = {
  background: string
  surface: string
  border: string
  text: string
}

function slotColors(name: string): SlotColors {
  return {
    background: `var(--opptak-slot-${name}-background)`,
    surface: `var(--opptak-slot-${name}-surface)`,
    border: `var(--opptak-slot-${name}-border)`,
    text: `var(--opptak-slot-${name}-text)`,
  }
}

const SLOT_COLORS = [
  slotColors("green"),
  slotColors("blue"),
  slotColors("yellow"),
  slotColors("red"),
] as const satisfies readonly SlotColors[]

const SLOT_COLOR_COUNT = SLOT_COLORS.length

export const REQUIRED_ATTENDEES = 2

export const INTERVIEW_SLOT_COLORS = {
  own: SLOT_COLORS[1],
  staffed: SLOT_COLORS[0],
  understaffed: SLOT_COLORS[3],
} as const satisfies Record<string, SlotColors>

export function getSlotColors(colorIndex: number): SlotColors {
  return SLOT_COLORS[Math.min(colorIndex, SLOT_COLOR_COUNT - 1)]
}

export function toSlotEventColors(colors: SlotColors) {
  return { backgroundColor: colors.surface, borderColor: colors.surface, textColor: colors.text }
}

function minutesIntoDay(time: Date | string): number {
  if (typeof time === "string") {
    const [hours, minutes] = time.split(":").map(Number)

    return hours * 60 + minutes
  }

  return time.getHours() * 60 + time.getMinutes()
}

export function getSlotPanel(start: Date | string, end: Date | string, minimumRows: number) {
  const startsAt = new Date(start)
  const durationMinutes = (new Date(end).getTime() - startsAt.getTime()) / 60_000
  const panelMinutes = Math.max(minimumRows * GRID_ROW_MINUTES, durationMinutes)

  return {
    anchorsToBottom: minutesIntoDay(startsAt) + panelMinutes > minutesIntoDay(DAY_END_TIME),
    heightPercentage: (panelMinutes / durationMinutes) * 100,
  }
}

export type SlotInterval = {
  id: string
  start: string
  end: string
}

function overlaps(first: { start: string; end: string }, second: { start: string; end: string }): boolean {
  return first.start < second.end && second.start < first.end
}

function orderByStart<T extends SlotInterval>(slots: T[]): T[] {
  return [...slots].sort(
    (first, second) => first.start.localeCompare(second.start) || first.id.localeCompare(second.id)
  )
}

function findTakenValues<T extends SlotInterval>(
  ordered: T[],
  slot: T,
  valueBySlotId: Map<string, number>
): Set<number | undefined> {
  return new Set(
    ordered.filter((other) => other.id !== slot.id && overlaps(slot, other)).map((other) => valueBySlotId.get(other.id))
  )
}

function hashSlotIdToColorIndex(slotId: string): number {
  let hash = 0

  for (const character of slotId) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }

  return hash % SLOT_COLOR_COUNT
}

function pickColorIndex(preferredColorIndex: number, takenColorIndexes: Set<number | undefined>): number {
  const offset = Array.from({ length: SLOT_COLOR_COUNT }, (_, step) => step).find(
    (step) => !takenColorIndexes.has((preferredColorIndex + step) % SLOT_COLOR_COUNT)
  )

  return (preferredColorIndex + (offset ?? 0)) % SLOT_COLOR_COUNT
}

export function findSlotColorIndexes(slots: SlotInterval[]): Map<string, number> {
  const ordered = orderByStart(slots)
  const colorIndexBySlotId = new Map<string, number>()

  for (const slot of ordered) {
    const takenColorIndexes = findTakenValues(ordered, slot, colorIndexBySlotId)

    colorIndexBySlotId.set(slot.id, pickColorIndex(hashSlotIdToColorIndex(slot.id), takenColorIndexes))
  }

  return colorIndexBySlotId
}

export function findSlotLanes(slots: SlotInterval[]): Map<string, number> {
  const ordered = orderByStart(slots)
  const laneBySlotId = new Map<string, number>()

  for (const slot of ordered) {
    const takenLanes = findTakenValues(ordered, slot, laneBySlotId)
    let lane = 0

    while (takenLanes.has(lane)) {
      lane += 1
    }

    laneBySlotId.set(slot.id, lane)
  }

  return laneBySlotId
}

export function findIntervalColorIndex(slots: SlotInterval[], candidate: SlotInterval): number {
  return findSlotColorIndexes([...slots.filter((slot) => slot.id !== candidate.id), candidate]).get(candidate.id) ?? 0
}

export function exceedsLaneLimit(slots: SlotInterval[], candidate: SlotInterval, laneLimit: number): boolean {
  const lanes = findSlotLanes([...slots.filter((slot) => slot.id !== candidate.id), candidate])

  return (lanes.get(candidate.id) ?? 0) >= laneLimit
}
