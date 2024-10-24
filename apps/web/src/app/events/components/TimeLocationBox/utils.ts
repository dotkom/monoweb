export const createGoogleCalendarLink = ({
  title,
  location,
  description,
  start,
  end,
}: {
  title: string
  location: string
  description: string
  start: Date
  end: Date
}) => {
  // 2023-02-23T11:40:00.000Z -> 20230223T114000Z
  // https://support.google.com/calendar/thread/108492403/google-calendar-links-and-wrong-start-end-times?hl=en
  const gcalDateTimeFormat = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")

  const gcalStart = gcalDateTimeFormat(start)
  const gcalEnd = gcalDateTimeFormat(end)

  return encodeURI(
    `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${gcalStart}/${gcalEnd}&details=${description}&location=${location}&sf=true&output=xml`
  )
}
