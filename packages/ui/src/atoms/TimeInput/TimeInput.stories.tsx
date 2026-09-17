import { useState } from "react"
import { TimeInput } from "./TimeInput"

export default {
  title: "TimeInput",
}

export const Default = () => {
  const [value, setValue] = useState<{ hours: number; minutes: number } | null>(null)

  return <TimeInput value={value} onChange={(value) => setValue(value)} />
}
