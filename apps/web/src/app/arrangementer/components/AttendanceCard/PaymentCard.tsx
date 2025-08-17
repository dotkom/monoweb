"use client"

import { useCountdown } from "@/utils/use-countdown"
import type { Attendance, Attendee } from "@dotkomonline/types"
import { Icon, cn } from "@dotkomonline/ui"
import Link from "next/link"
import type { HTMLProps, PropsWithChildren } from "react"

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

export const PaymentCard = ({ attendance, attendee }: { attendance: Attendance; attendee: Attendee | null }) => {
  const countdownText = useCountdown(attendee?.paymentDeadline ?? null)

  if (!attendance.attendancePrice) {
    return null
  }

  if (!attendee?.reserved) {
    return <GenericPaymentCard disabled>Pris: {attendance.attendancePrice} kr</GenericPaymentCard>
  }

  if (attendee.paymentReservedAt || attendee.paymentChargedAt) {
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

  if (attendee.paymentRefundedAt) {
    return (
      <GenericPaymentCard className="bg-green-200">
        <p>Betaling refundert</p>
      </GenericPaymentCard>
    )
  }

  return <GenericPaymentCard>Ukjent status</GenericPaymentCard>
}
