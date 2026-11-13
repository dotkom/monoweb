import type { AttendanceView, Attendee } from "@dotkomonline/rpc/attendance"
import { Text } from "@dotkomonline/ui"
import { IconArrowForward, IconCheck, IconCoins, IconHourglassEmpty, IconX } from "@tabler/icons-react"
import { addDays, formatDate, roundToNearestHours } from "date-fns"
import { nb } from "date-fns/locale"
import { AttendanceStatusRow } from "./AttendanceStatusRow"

// Allow for weekends when displaying the expected refund arrival date.
const MAX_REFUND_PROCESSING_DAYS = 12

interface PaymentStatusProps {
  attendance: AttendanceView
  attendee: Attendee | null
  chargeScheduleDate?: Date | null
  hideUnpaidStatus?: boolean
}

interface PriceStatusProps {
  price: number
}

const PriceStatus = ({ price, showPaymentTiming = false }: { price: number; showPaymentTiming?: boolean }) => {
  return (
    <AttendanceStatusRow icon={<IconCoins />}>
      <Text>{price} kr</Text>
      {showPaymentTiming && <Text className="text-xs">Du betaler når du får plass</Text>}
    </AttendanceStatusRow>
  )
}

const UnpaidStatus = ({ price }: PriceStatusProps) => {
  return (
    <AttendanceStatusRow
      icon={<IconX className="text-red-700 dark:text-red-200" />}
      className="w-fit pl-1 pr-2.25 -ml-1 -mr-2.25 rounded-sm bg-orange-200 dark:bg-red-900"
    >
      <Text>{price} kr ubetalt</Text>
    </AttendanceStatusRow>
  )
}

interface RefundedStatusProps {
  price: number
  refundedAt: Date | null
}

const RefundedStatus = ({ price, refundedAt }: RefundedStatusProps) => {
  return (
    <AttendanceStatusRow icon={<IconArrowForward />}>
      <Text>Du er refundert {price} kr</Text>
      {refundedAt !== null && (
        <Text className="text-xs">
          Pengene ankommer senest{" "}
          {formatDate(roundToNearestHours(addDays(refundedAt, MAX_REFUND_PROCESSING_DAYS)), "dd. MMM 'kl.' HH", {
            locale: nb,
          })}
        </Text>
      )}
    </AttendanceStatusRow>
  )
}

const PaidStatus = ({ price }: PriceStatusProps) => {
  return (
    <AttendanceStatusRow icon={<IconCheck className="text-green-700 dark:text-green-200" />}>
      <Text>Du har betalt {price} kr</Text>
    </AttendanceStatusRow>
  )
}

interface ReservedPaymentStatusProps {
  price: number
  chargeScheduleDate?: Date | null
}

const ReservedPaymentStatus = ({ price, chargeScheduleDate }: ReservedPaymentStatusProps) => {
  return (
    <AttendanceStatusRow icon={<IconCheck className="text-green-700 dark:text-green-200" />}>
      <Text>Du har reservert {price} kr</Text>

      {chargeScheduleDate != null && (
        <Text className="text-xs">
          Du blir trukket rundt{" "}
          {formatDate(roundToNearestHours(chargeScheduleDate), "dd. MMM 'kl.' HH", { locale: nb })}
        </Text>
      )}
    </AttendanceStatusRow>
  )
}

export const PaymentStatus = ({
  attendance,
  attendee,
  chargeScheduleDate,
  hideUnpaidStatus = false,
}: PaymentStatusProps) => {
  const payment = attendee?.payment ?? null
  const price = payment === null ? attendance.attendancePrice : payment.amountOre / 100

  if (price === null) {
    return null
  }

  if (attendee === null || price === 0 || (attendee.registeredAt === null && payment === null)) {
    return <PriceStatus price={price} showPaymentTiming={attendee?.registeredAt === null && price > 0} />
  }

  switch (payment?.status) {
    case "WAIVED":
      return (
        <AttendanceStatusRow icon={<IconCheck />}>
          <Text>Du er fritatt fra betaling</Text>
        </AttendanceStatusRow>
      )

    case "REFUNDED":
      return <RefundedStatus price={payment.refundedAmountOre / 100} refundedAt={payment.refundedAt} />

    case "REFUND_PENDING":
      return (
        <AttendanceStatusRow icon={<IconHourglassEmpty />}>
          <Text>Refusjonen behandles</Text>
        </AttendanceStatusRow>
      )

    case "PARTIALLY_REFUNDED":
      return (
        <AttendanceStatusRow icon={<IconArrowForward />}>
          <Text>Du er refundert {payment.refundedAmountOre / 100} kr</Text>
          <Text className="text-xs">Gjenstående betalt beløp: {payment.paidAmountOre / 100} kr</Text>
        </AttendanceStatusRow>
      )

    case "PAID":
      return <PaidStatus price={payment.paidAmountOre / 100} />

    case "AUTHORIZED":
      return (
        <ReservedPaymentStatus price={price} chargeScheduleDate={payment.captureScheduledAt ?? chargeScheduleDate} />
      )

    case "PROCESSING":
      return (
        <AttendanceStatusRow icon={<IconHourglassEmpty />}>
          <Text>Betalingen behandles</Text>
        </AttendanceStatusRow>
      )

    case "UNPAID":
    case "CANCELLED":
    case "EXPIRED":
    case "FAILED":
    case undefined:
      break
  }

  if (hideUnpaidStatus) {
    return null
  }

  if (attendee.registeredAt === null) {
    return <PriceStatus price={price} showPaymentTiming />
  }

  if (payment?.checkoutUrl == null) {
    return (
      <AttendanceStatusRow icon={<IconCoins />}>
        <Text>{price} kr ubetalt</Text>
        <Text className="text-sm text-red-600 dark:text-red-400">Betalingslenken er ikke tilgjengelig.</Text>
        <Text className="text-sm">Kontakt arrangøren for hjelp!</Text>
      </AttendanceStatusRow>
    )
  }

  return <UnpaidStatus price={price} />
}
