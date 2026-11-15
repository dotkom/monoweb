import type { Attendee } from "@dotkomonline/rpc/attendance"
import { Button } from "@dotkomonline/ui"
import {
  useStartAttendeePaymentMutation,
  useCancelAttendeePaymentMutation,
  useSyncAttendeePaymentMutation,
  useWaiveAttendeePaymentMutation,
} from "../../mutations"

interface AttendeePaymentActionsProps {
  attendee: Attendee
  canEdit: boolean
}

export function AttendeePaymentActions({ attendee, canEdit }: AttendeePaymentActionsProps) {
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
          Oppdater fra Stripe
        </Button>
      )}
      {payment?.canRefund === true && (
        <Button size="sm" disabled={isDisabled} onClick={() => cancelPayment.mutate(input)}>
          Refunder
        </Button>
      )}
      {payment?.canCancel === true && (
        <Button size="sm" variant="secondary" disabled={isDisabled} onClick={() => cancelPayment.mutate(input)}>
          Avbryt betaling
        </Button>
      )}
      {canStartCheckout && (
        <Button size="sm" variant="secondary" disabled={isDisabled} onClick={() => startPayment.mutate(input)}>
          Ny betaling
        </Button>
      )}
      {payment?.canWaive === true && (
        <Button size="sm" variant="secondary" disabled={isDisabled} onClick={() => waivePayment.mutate(input)}>
          Frita fra betaling
        </Button>
      )}
    </div>
  )
}
