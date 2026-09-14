import { useState } from "react"
import { DateTimePicker } from "./DateTimePicker"

export default {
  title: "DateTimePicker",
}

export const Default = () => {
  const [date, setDate] = useState<Date | null>(null)

  return <DateTimePicker value={date} onChange={setDate} withTime />
}
