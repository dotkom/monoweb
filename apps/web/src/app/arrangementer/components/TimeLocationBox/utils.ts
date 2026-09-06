// 2023-02-23T11:40:00.000Z -> 20230223T114000Z
// https://support.google.com/calendar/thread/108492403/google-calendar-links-and-wrong-start-end-times?hl=en
const formatGoogleCalendarDateTime = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")

export const createGoogleCalendarLink = ({
  title,
  location,
  description,
  start,
  end,
}: {
  title: string
  location?: string | null
  description: string
  start: Date
  end: Date
}) => {
  const dates = `${formatGoogleCalendarDateTime(start)}/${formatGoogleCalendarDateTime(end)}`

  const googleCalendarUrl = new URL("https://www.google.com/calendar/render")

  googleCalendarUrl.searchParams.set("action", "TEMPLATE")
  googleCalendarUrl.searchParams.set("text", title)
  googleCalendarUrl.searchParams.set("dates", dates)
  googleCalendarUrl.searchParams.set("details", description)
  googleCalendarUrl.searchParams.set("sf", "true")
  googleCalendarUrl.searchParams.set("output", "xml")

  if (location) {
    googleCalendarUrl.searchParams.set("location", location)
  }

  return googleCalendarUrl.toString()
}
