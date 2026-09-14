import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "./Calendar"

export const Default = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return <Calendar selected={date} onSelect={setDate} mode="single" required />
}

export const Range = () => {
  const [date, setDate] = useState<DateRange | undefined>({ from: new Date(), to: new Date() })

  return <Calendar selected={date} onSelect={setDate} mode="range" required />
}
