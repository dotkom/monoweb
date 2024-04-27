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

  const _start = gcalDateTimeFormat(start)
  const _end = gcalDateTimeFormat(end)

  return encodeURI(
    `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${_start}/${_end}&details=${description}&location=${location}&sf=true&output=xml`
  )
}

export const getDisplayDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long", // e.g., "fredag"
    year: "numeric", // e.g., "2024"
    month: "long", // e.g., "mai"
    day: "numeric", // e.g., "17"
  }
  // This will create a string in the format "fredag 17. mai 2024"
  const formattedDate = date.toLocaleDateString("nb-NO", options)

  // Splitting the result to extract the weekday and the date part
  const parts = formattedDate.split(" ") // ["fredag", "17.", "mai", "2024"]
  const weekDay = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  const datePart = parts.slice(1).join(" ") // "17. mai 2024"

  // Getting the time part in the required format
  const time = date.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return {
    weekDay, // "fredag"
    date: datePart, // "17. mai 2024"
    time, // "16:15"
  }
}
