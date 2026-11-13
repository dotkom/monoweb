import type { Attendee } from "@dotkomonline/rpc/attendance"
import { Button } from "@dotkomonline/ui"
import {
  useStartAttendeePaymentMutation,
  useCancelAttendeePaymentMutation,
  useSyncAttendeePaymentMutation,
  useWaiveAttendeePaymentMutation,
} from "../../mutations"
import { IconArrowForward, IconCheck, IconPlus, IconRefresh, IconX } from "@tabler/icons-react"

interface AttendeePaymentActionsProps {
  attendee: Attendee
  canEdit: boolean
  hasAttendancePrice: boolean
}

export function AttendeePaymentActions({ attendee, canEdit, hasAttendancePrice }: AttendeePaymentActionsProps) {
  const startPayment = useStartAttendeePaymentMutation()
  const cancelPayment = useCancelAttendeePaymentMutation()
  const syncPayment = useSyncAttendeePaymentMutation()
  const waivePayment = useWaiveAttendeePaymentMutation()

  const payment = attendee.payment
  const input = { attendeeId: attendee.id }
  const isPending = startPayment.isPending || cancelPayment.isPending || syncPayment.isPending || waivePayment.isPending
  const isDisabled = !canEdit || isPending
  const canStartCheckout = payment === null || (payment.canStartCheckout && payment.checkoutUrl === null)

  return (
    <div className="flex flex-wrap gap-2">
      {payment?.attemptId != null && (
        <Button size="sm" variant="secondary" disabled={isDisabled} onClick={() => syncPayment.mutate(input)}>
          <IconRefresh className="size-4" />
          Oppdater fra Stripe
        </Button>
      )}

      {payment?.canRefund === true && (
        <Button size="sm" disabled={isDisabled} onClick={() => cancelPayment.mutate(input)}>
          <IconArrowForward className="size-4" />
          Refunder
        </Button>
      )}

      {payment?.canCancel === true && (
        <Button size="sm" variant="destructive" disabled={isDisabled} onClick={() => cancelPayment.mutate(input)}>
          <IconX className="size-4" />
          Avbryt betaling
        </Button>
      )}

      {canStartCheckout && hasAttendancePrice && (
        <Button size="sm" variant="secondary" disabled={isDisabled} onClick={() => startPayment.mutate(input)}>
          <IconPlus className="size-4" />
          {payment === null ? "Opprett betaling" : "Ny betalingslenke"}
        </Button>
      )}

      {payment?.canWaive === true && (
        <Button size="sm" variant="secondary" disabled={isDisabled} onClick={() => waivePayment.mutate(input)}>
          <IconCheck className="size-4" />
          Frita fra betaling
        </Button>
      )}
    </div>
  )
}
