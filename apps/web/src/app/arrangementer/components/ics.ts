import ical, { type ICalEventData } from "ical-generator"

const CALENDAR_PRODUCT_ID = "online.ntnu.no"
const ICS_MIME_TYPE = "text/calendar;charset=utf-8"

export function createIcsBody(event: ICalEventData, calendarName?: string) {
  const calendar = ical({
    name: calendarName,
    prodId: CALENDAR_PRODUCT_ID,
  })

  calendar.createEvent(event)

  return calendar.toString()
}

function createIcsObjectUrl(icsBody: string) {
  const blob = new Blob([icsBody], { type: ICS_MIME_TYPE })

  return URL.createObjectURL(blob)
}

export function openIcsFile(icsBody: string) {
  const objectUrl = createIcsObjectUrl(icsBody)
  const link = document.createElement("a")

  link.href = objectUrl
  link.target = "_blank"
  link.rel = "noopener noreferrer"
  link.click()

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 1000)
}

export function downloadIcsFile(icsBody: string, filename: string) {
  const objectUrl = createIcsObjectUrl(icsBody)
  const link = document.createElement("a")

  link.href = objectUrl
  link.download = filename
  link.click()

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 1000)
}
