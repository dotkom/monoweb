"use client"

import type { Attendance, Attendee } from "@dotkomonline/types"
import { Icon, cn } from "@dotkomonline/ui"
import { intervalToDuration } from "date-fns"
import Link from "next/link"
import { type HTMLProps, type PropsWithChildren, useEffect, useState } from "react"

function formatTimeLeft(target: Date) {
  const now = new Date()
  const duration = intervalToDuration({ start: now, end: target })

  const days = duration.days ?? 0
  const hours = duration.hours ?? 0
  const minutes = duration.minutes ?? 0
  const seconds = duration.seconds ?? 0

  if (!minutes && !hours && !days) {
    return `${seconds} sekunder`
  }

  if (!hours && !days) {
    return `${minutes} minutter og ${seconds} sekunder`
  }

  if (!days) {
    return `${hours}:${minutes}:${seconds}`
  }

  return `${days} dager`
}

function useCountdown(deadline: Date | null) {
  const [deadlineCountdown, setDeadlineCountdown] = useState<string | null>(null)

  useEffect(() => {
    if (!deadline) {
      return
    }
    setDeadlineCountdown(formatTimeLeft(deadline))
    const interval = setInterval(() => {
      setDeadlineCountdown(formatTimeLeft(deadline))
    }, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  if (deadline && deadline < new Date()) {
    return "nå"
  }

  return deadlineCountdown
}

const GenericPaymentCard = ({ children, disabled, className }: PropsWithChildren<HTMLProps<HTMLDivElement>>) => (
  <div
    className={cn(
      "rounded-lg h-fit min-h-[4rem] font-medium flex items-center justify-center gap-1 bg-amber-100",
      {
        "cursor-not-allowed": disabled,
      },
      className
    )}
  >
    <Icon className="text-lg bold" icon="tabler:credit-card" />
    <div className="flex flex-col items-center">{children}</div>
  </div>
)

export const PaymentCard = ({ attendance, attendee }: { attendance: Attendance; attendee?: Attendee }) => {
  if (!attendance.attendancePrice) {
    return null
  }

  if (attendee === undefined) {
    return <GenericPaymentCard disabled>Pris: {attendance.attendancePrice} kr</GenericPaymentCard>
  }

  const countdownText = useCountdown(attendee.paymentDeadline)

  if (attendee.paid) {
    return (
      <GenericPaymentCard disabled className="bg-green-200">
        {attendance.attendancePrice}kr betalt
      </GenericPaymentCard>
    )
  }

  if (attendee.paymentDeadline && attendee.paymentLink) {
    return (
      <Link href={attendee.paymentLink}>
        <GenericPaymentCard className="bg-amber-300">
          <p>Betal innen {countdownText}</p>
        </GenericPaymentCard>
      </Link>
    )
  }

  return <GenericPaymentCard>...</GenericPaymentCard>
}
