"use client"
import { type Attendance, type User, getAttendee } from "@dotkomonline/types"
import { Icon, Stripes, Text, cn } from "@dotkomonline/ui"
import Link from "next/link"

interface PaymentCardProps {
  attendance: Attendance
  user: User | null
}

export const PaymentCard = ({ attendance, user }: PaymentCardProps) => {
  if (!attendance.attendancePrice) {
    return null
  }

  const attendee = getAttendee(attendance, user)

  if (!user || !attendee?.reserved) {
    return (
      <div
        className={cn(
          "rounded-lg h-fit min-h-[4rem] flex items-center justify-center",
          "bg-gray-100 cursor-not-allowed"
        )}
      >
        <div className="flex flex-row items-center justify-center gap-2 font-medium">
          <Icon className="text-lg font-normal" icon="tabler:credit-card" />
          <Text>{attendance.attendancePrice} kr</Text>
        </div>
      </div>
    )
  }

  if (attendee.paymentReservedAt || attendee.paymentChargedAt) {
    return (
      <div
        className={cn(
          "rounded-lg h-fit min-h-[4rem] flex items-center justify-center",
          "bg-gray-200 cursor-not-allowed"
        )}
      >
        <div className="flex flex-row items-center justify-center gap-1 font-medium">
          <Icon className="text-lg font-normal" icon="tabler:credit-card" />
          <Text>{attendance.attendancePrice} kr betalt</Text>
        </div>
      </div>
    )
  }

  if (attendee.paymentDeadline && attendee.paymentLink) {
    return (
      <Link
        href={attendee.paymentLink}
        className="rounded-lg h-fit min-h-[4rem] flex items-center justify-center bg-yellow-200"
      >
        <div className="flex flex-row items-center justify-center gap-1 font-medium">
          <Icon className="text-lg font-normal" icon="tabler:credit-card" />
          <Text>Betal</Text>
        </div>
      </Link>
    )
  }

  if (attendee.paymentRefundedAt) {
    return (
      <Stripes
        colorA={"bg-gray-200"}
        colorB={"bg-green-200"}
        animated
        className={cn("rounded-lg h-fit min-h-[4rem] flex items-center justify-center")}
      >
        <div className="flex flex-row items-center justify-center gap-1 font-medium">
          <Icon className="text-lg font-normal" icon="tabler:credit-card" />
          <Text>Betal</Text>
        </div>
      </Stripes>
    )
  }

  return null
}
