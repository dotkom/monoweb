"use client"

import { RollingNumber } from "@/components/RollingNumber"
import type { CountdownFormatterData } from "@/utils/countdown/use-countdown"
import type { ReactNode } from "react"

export function formatRollingCountdown(countdown: CountdownFormatterData): ReactNode {
  if (countdown === "NOW") {
    return <>Nå</>
  }

  if (countdown.years) {
    return (
      <>
        <RollingNumber value={countdown.years} /> år
      </>
    )
  }

  if (countdown.months) {
    return (
      <>
        <RollingNumber value={countdown.months} /> måned{countdown.months !== 1 ? "er" : ""}
      </>
    )
  }

  if (countdown.days) {
    return (
      <>
        <RollingNumber value={countdown.days} /> dag{countdown.days !== 1 ? "er" : ""}
      </>
    )
  }

  if (countdown.hours) {
    return (
      <>
        <RollingNumber minDigits={2} value={countdown.hours} />:
        <RollingNumber minDigits={2} value={countdown.minutes} />:
        <RollingNumber minDigits={2} value={countdown.seconds} />
      </>
    )
  }

  return (
    <>
      <RollingNumber minDigits={2} value={countdown.minutes} />:
      <RollingNumber minDigits={2} value={countdown.seconds} />
    </>
  )
}
