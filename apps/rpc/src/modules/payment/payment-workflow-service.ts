import type { DBClient, DBHandle } from "@dotkomonline/db"
import type { PaymentAttemptIdentifiers, PaymentRecord } from "./payment"
import type { PaymentLedgerService } from "./payment-ledger-service"

export interface PaymentWorkflowService {
  /**
   * Opens or recovers Stripe checkout, then runs the payment change handler.
   */
  openCheckout(client: DBClient, attemptId: string): Promise<PaymentRecord>

  /**
   * Updates the payment attempt using Stripe data, then runs the payment change handler.
   */
  syncAttempt(handle: DBHandle, attemptId: string, identifiers: PaymentAttemptIdentifiers): Promise<PaymentRecord>
}

/**
 * Updates a payment, then updates whatever the payment is for.
 *
 * For an event payment, this means updating the attendee's registration after the payment changes.
 *
 * The payment ledger service handles the payment. The onPaymentChanged function supplied in core.ts
 * handles the registration. This keeps the payment code usable for things other than event attendance.
 *
 * Stripe webhooks and checkout jobs use this service so both steps run together.
 * If either step fails, the error is passed back so the caller can retry. Both steps must be safe to repeat.
 */
export function getPaymentWorkflowService(
  paymentLedgerService: PaymentLedgerService,
  onPaymentChanged: (handle: DBHandle, payment: PaymentRecord) => Promise<void>
): PaymentWorkflowService {
  return {
    async openCheckout(client, attemptId) {
      const payment = await paymentLedgerService.startCheckout(client, attemptId)
      await onPaymentChanged(client, payment)

      return payment
    },

    async syncAttempt(handle, attemptId, identifiers) {
      const payment = await paymentLedgerService.syncAttempt(handle, attemptId, identifiers)
      await onPaymentChanged(handle, payment)

      return payment
    },
  }
}
