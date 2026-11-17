import type { DBClient, DBHandle } from "@dotkomonline/db"
import { FailedPreconditionError } from "../../error"
import { buildPaymentView, getRefundedAmountOre, type CheckoutInput, type PaymentView } from "../payment/payment"
import type { PaymentLedgerService } from "../payment/payment-ledger-service"
import type { PaymentRepository } from "../payment/payment-repository"
import type { Attendance, Attendee } from "./attendance"
import type { Event } from "./event"

export interface AttendanceCheckoutInput extends CheckoutInput {
  attendance: Pick<Attendance, "attendancePrice">
  attendee: Pick<Attendee, "id" | "userId">
  event: Pick<Event, "id" | "title">
}

export interface AttendancePaymentService {
  /**
   * Creates or reuses the attendee payment and prepares Stripe checkout without contacting Stripe.
   */
  prepareCheckout(handle: DBHandle, input: AttendanceCheckoutInput): Promise<PaymentView>

  /**
   * Opens or recovers the Stripe checkout for the latest payment attempt and returns the payment view.
   */
  openCheckout(client: DBClient, paymentId: string): Promise<PaymentView>

  /**
   * Updates the latest payment attempt using Stripe data and returns the payment view.
   */
  syncPayment(handle: DBHandle, paymentId: string): Promise<PaymentView>

  expireOpenCheckout(client: DBClient, attemptId: string): Promise<boolean>
  cancelUnopenedCheckout(handle: DBHandle, attemptId: string): Promise<void>

  /**
   * Cancels the latest payment attempt. Does nothing if the payment has no payment attempts.
   */
  cancel(handle: DBHandle, paymentId: string): Promise<void>

  /**
   * Captures the latest payment attempt. Requires an existing payment authorization.
   */
  capture(handle: DBHandle, paymentId: string): Promise<void>

  /**
   * Updates all payment attempts using Stripe data and refunds each remaining captured balance.
   */
  refund(handle: DBHandle, paymentId: string, requestedByUserId: string): Promise<void>

  /**
   * Cancels an eligible active payment attempt before recording a waiver of the payment requirement.
   */
  waive(handle: DBHandle, paymentId: string, waivedByUserId: string, reason: string | null): Promise<void>
}

export function getAttendancePaymentService(
  paymentRepository: PaymentRepository,
  paymentLedgerService: PaymentLedgerService
): AttendancePaymentService {
  return {
    async prepareCheckout(handle, { attendance, attendee, event, ...checkoutInput }) {
      if (attendance.attendancePrice === null || attendance.attendancePrice <= 0) {
        throw new FailedPreconditionError("Cannot create checkout without a positive attendance price")
      }

      let payment = await paymentRepository.findByAttendeeId(handle, attendee.id)

      if (payment === null) {
        payment = await paymentLedgerService.create(handle, {
          attendeeId: attendee.id,
          eventId: event.id,
          userId: attendee.userId,
          description: event.title,
          // attendancePrice is in NOK, so we convert to Øre (1 NOK = 100 Øre)
          amountOre: attendance.attendancePrice * 100,
        })
      }

      const updatedPayment = await paymentLedgerService.prepareCheckout(handle, payment.id, checkoutInput)

      return buildPaymentView(updatedPayment)
    },

    async openCheckout(client, paymentId) {
      const payment = await paymentLedgerService.getById(client, paymentId)
      const attempt = payment.attempts[0]

      if (attempt === undefined) {
        return buildPaymentView(payment)
      }

      const updatedPayment = await paymentLedgerService.startCheckout(client, attempt.id)

      return buildPaymentView(updatedPayment)
    },

    async syncPayment(handle, paymentId) {
      const payment = await paymentLedgerService.getById(handle, paymentId)
      const attempt = payment.attempts[0]

      if (attempt === undefined) {
        return buildPaymentView(payment)
      }

      const updatedPayment = await paymentLedgerService.syncAttempt(handle, attempt.id)

      return buildPaymentView(updatedPayment)
    },

    expireOpenCheckout: paymentLedgerService.expireOpenCheckout,
    cancelUnopenedCheckout: paymentRepository.cancelUnopenedCheckout,

    async cancel(handle, paymentId) {
      const payment = await paymentLedgerService.getById(handle, paymentId)
      const attempt = payment.attempts[0]

      if (attempt !== undefined) {
        await paymentLedgerService.cancel(handle, attempt.id)
      }
    },

    async capture(handle, paymentId) {
      const payment = await paymentLedgerService.getById(handle, paymentId)
      const attempt = payment.attempts[0]

      if (attempt === undefined) {
        throw new FailedPreconditionError(`Payment(ID=${paymentId}) has no checkout attempt`)
      }

      await paymentLedgerService.capture(handle, attempt.id)
    },

    async refund(handle, paymentId, requestedByUserId) {
      const payment = await paymentLedgerService.getById(handle, paymentId)
      let synchronizedPayment = payment

      for (const attempt of payment.attempts) {
        synchronizedPayment = await paymentLedgerService.syncAttempt(handle, attempt.id)
      }

      const refundableAttempts = synchronizedPayment.attempts.filter((attempt) => {
        return attempt.status === "CAPTURED" && attempt.capturedAmountOre > getRefundedAmountOre(attempt.refunds)
      })

      if (refundableAttempts.length === 0) {
        throw new FailedPreconditionError(`Payment(ID=${paymentId}) has no captured balance to refund`)
      }

      for (const attempt of refundableAttempts) {
        await paymentLedgerService.refund(handle, attempt.id, requestedByUserId)
      }
    },

    async waive(handle, paymentId, waivedByUserId, reason) {
      const payment = await this.syncPayment(handle, paymentId)

      if (payment.canCancel) {
        await this.cancel(handle, paymentId)
      }

      await paymentLedgerService.waive(handle, paymentId, waivedByUserId, reason)
    },
  }
}
