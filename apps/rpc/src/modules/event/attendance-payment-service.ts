import type { DBHandle } from "@dotkomonline/db"
import { FailedPreconditionError } from "../../error"
import { buildPaymentView, type CheckoutInput, type PaymentView } from "../payment/payment"
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
  startCheckout(handle: DBHandle, input: AttendanceCheckoutInput): Promise<PaymentView>
  /**
   * Syncs the payment with the ledger (and Stripe).
   */
  syncPayment(handle: DBHandle, paymentId: string): Promise<PaymentView>
  cancel(handle: DBHandle, paymentId: string): Promise<void>
  capture(handle: DBHandle, paymentId: string): Promise<void>
  refund(handle: DBHandle, paymentId: string, requestedByUserId: string): Promise<void>
  waive(handle: DBHandle, paymentId: string, waivedByUserId: string, reason: string | null): Promise<void>
}

/**
 * Connects attendance requirements to the ledger without exposing payment attempts to attendance callers.
 */
export function getAttendancePaymentService(
  paymentRepository: PaymentRepository,
  paymentLedgerService: PaymentLedgerService
): AttendancePaymentService {
  return {
    async startCheckout(handle, { attendance, attendee, event, ...checkoutInput }) {
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

      const updatedPayment = await paymentLedgerService.startCheckout(handle, payment.id, checkoutInput)

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
      const attempt = payment.attempts[0]

      if (attempt === undefined) {
        throw new FailedPreconditionError(`Payment(ID=${paymentId}) has no checkout attempt`)
      }

      await paymentLedgerService.refund(handle, attempt.id, requestedByUserId)
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
