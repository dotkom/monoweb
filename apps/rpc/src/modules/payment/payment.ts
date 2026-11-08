import { z } from "zod"
import { isAfter } from "date-fns"

export const PaymentAttemptStatusSchema = z.enum([
  "CREATED",
  "CHECKOUT_OPEN",
  "PROCESSING",
  "AUTHORIZED",
  "CAPTURED",
  "CANCELLED",
  "EXPIRED",
  "FAILED",
])

export type PaymentAttemptStatus = z.infer<typeof PaymentAttemptStatusSchema>

export const PaymentCaptureModeSchema = z.enum(["AUTOMATIC", "MANUAL"])

export const PaymentRefundStatusSchema = z.enum(["REQUESTED", "PENDING", "SUCCEEDED", "FAILED", "CANCELLED"])

export type PaymentRefundStatus = z.infer<typeof PaymentRefundStatusSchema>

export const PaymentRefundSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  stripeRefundId: z.string().nullable(),
  amountOre: z.int(),
  status: PaymentRefundStatusSchema,
  reason: z.string().nullable(),
  paymentAttemptId: z.string(),
  requestedByUserId: z.string().nullable(),
})

export type PaymentRefund = z.infer<typeof PaymentRefundSchema>

export const PaymentAttemptSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: PaymentAttemptStatusSchema,
  captureMode: PaymentCaptureModeSchema,
  stripeCheckoutSessionId: z.string().nullable(),
  stripePaymentIntentId: z.string().nullable(),
  checkoutUrl: z.string().nullable(),
  checkoutExpiresAt: z.date().nullable(),
  captureScheduledAt: z.date().nullable(),
  authorizationExpiresAt: z.date().nullable(),
  authorizedAt: z.date().nullable(),
  capturedAt: z.date().nullable(),
  lastSyncedAt: z.date().nullable(),
  paymentId: z.string(),
  refunds: z.array(PaymentRefundSchema),
})

export type PaymentAttempt = z.infer<typeof PaymentAttemptSchema>

export const PaymentRecordSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  description: z.string(),
  amountOre: z.int(),
  waivedAt: z.date().nullable(),
  waiverReason: z.string().nullable(),
  userId: z.string(),
  waivedByUserId: z.string().nullable(),
  attendeeId: z.string().nullable(),
  eventId: z.string().nullable(),
  attempts: z.array(PaymentAttemptSchema),
})

export type PaymentRecord = z.infer<typeof PaymentRecordSchema>

export const PaymentWriteSchema = PaymentRecordSchema.pick({
  userId: true,
  description: true,
  amountOre: true,
}).extend({
  id: z.string().optional(),
  attendeeId: z.string().optional(),
  eventId: z.string().optional(),
})

export type PaymentWrite = z.infer<typeof PaymentWriteSchema>

export const PaymentAttemptWriteSchema = PaymentAttemptSchema.pick({
  id: true,
  paymentId: true,
  captureMode: true,
  captureScheduledAt: true,
})

export type PaymentAttemptWrite = z.infer<typeof PaymentAttemptWriteSchema>

export const PaymentRefundWriteSchema = PaymentRefundSchema.omit({
  updatedAt: true,
}).partial({
  id: true,
  createdAt: true,
  stripeRefundId: true,
  status: true,
  reason: true,
  requestedByUserId: true,
})

export type PaymentRefundWrite = z.infer<typeof PaymentRefundWriteSchema>

export const PaymentUpdateSchema = PaymentRecordSchema.pick({
  waivedAt: true,
  waivedByUserId: true,
  waiverReason: true,
}).partial()

export type PaymentUpdate = z.infer<typeof PaymentUpdateSchema>

export const PaymentAttemptUpdateSchema = PaymentAttemptSchema.omit({
  id: true,
  paymentId: true,
  createdAt: true,
  updatedAt: true,
  refunds: true,
}).partial()

export type PaymentAttemptUpdate = z.infer<typeof PaymentAttemptUpdateSchema>

export const PaymentRefundUpdateSchema = PaymentRefundSchema.pick({
  stripeRefundId: true,
  status: true,
  amountOre: true,
}).partial()

export type PaymentRefundUpdate = z.infer<typeof PaymentRefundUpdateSchema>

export const PaymentAttemptIdentifiersSchema = PaymentAttemptSchema.pick({
  id: true,
  stripeCheckoutSessionId: true,
  stripePaymentIntentId: true,
}).partial()

export type PaymentAttemptIdentifiers = z.infer<typeof PaymentAttemptIdentifiersSchema>

export const CreatePaymentInputSchema = PaymentWriteSchema.omit({
  id: true,
})

export type CreatePaymentInput = z.infer<typeof CreatePaymentInputSchema>

export const CheckoutInputSchema = z.object({
  returnUrl: z.string(),
  customerEmail: z.string().nullable(),
  captureMode: PaymentCaptureModeSchema,
  captureScheduledAt: z.date().nullable(),
})

export type CheckoutInput = z.infer<typeof CheckoutInputSchema>

export const PaymentViewStatusSchema = z.enum([
  "UNPAID",
  "PROCESSING",
  "AUTHORIZED",
  "PAID",
  "PARTIALLY_REFUNDED",
  "REFUND_PENDING",
  "REFUNDED",
  "CANCELLED",
  "EXPIRED",
  "FAILED",
  "WAIVED",
])

export type PaymentViewStatus = z.infer<typeof PaymentViewStatusSchema>

export const PaymentViewSchema = z.object({
  id: z.string(),
  amountOre: z.int(),
  description: z.string(),
  status: PaymentViewStatusSchema,
  isRequirementSatisfied: z.boolean(),
  canStartCheckout: z.boolean(),
  canRefund: z.boolean(),
  canCancel: z.boolean(),
  canWaive: z.boolean(),
  checkoutUrl: z.string().nullable(),
  stripeDashboardUrl: z.string().nullable(),
  attemptId: z.string().nullable(),
  captureScheduledAt: z.date().nullable(),
  refundedAt: z.date().nullable(),
  refundedAmountOre: z.int(),
  paidAmountOre: z.int(),
  waivedAt: z.date().nullable(),
})

export type PaymentView = z.infer<typeof PaymentViewSchema>

export function getRefundedAmountOre(refunds: readonly PaymentRefund[]): number {
  const successfulRefunds = refunds.filter((refund) => refund.status === "SUCCEEDED")

  return successfulRefunds.reduce((amountOre, refund) => amountOre + refund.amountOre, 0)
}

export function buildPaymentView(payment: PaymentRecord): PaymentView {
  const latestAttempt = payment.attempts[0] ?? null

  const refunds = payment.attempts.flatMap((attempt) => attempt.refunds)
  const successfulRefunds = refunds.filter((refund) => refund.status === "SUCCEEDED")

  const refundedAmountOre = getRefundedAmountOre(refunds)
  const hasPendingRefund = refunds.some((refund) => refund.status === "REQUESTED" || refund.status === "PENDING")

  const capturedAttempts = payment.attempts.filter((attempt) => attempt.status === "CAPTURED")
  const capturedAmountOre = capturedAttempts.length * payment.amountOre

  const paidAmountOre = capturedAmountOre - refundedAmountOre
  const hasOutstandingCapture = paidAmountOre > 0

  const hasAuthorization = payment.attempts.some((attempt) => attempt.status === "AUTHORIZED")

  const isWaived = payment.waivedAt !== null

  let status: PaymentViewStatus = PaymentViewStatusSchema.enum.UNPAID

  if (hasPendingRefund) {
    status = PaymentViewStatusSchema.enum.REFUND_PENDING
  } else if (hasOutstandingCapture) {
    const isPartiallyRefunded = paidAmountOre < payment.amountOre

    if (isPartiallyRefunded) {
      status = PaymentViewStatusSchema.enum.PARTIALLY_REFUNDED
    } else {
      status = PaymentViewStatusSchema.enum.PAID
    }
  } else if (hasAuthorization) {
    status = PaymentViewStatusSchema.enum.AUTHORIZED
  } else if (latestAttempt?.status === "CAPTURED") {
    status = PaymentViewStatusSchema.enum.REFUNDED
  } else if (latestAttempt?.status === "PROCESSING") {
    status = PaymentViewStatusSchema.enum.PROCESSING
  } else if (latestAttempt?.status === "CANCELLED") {
    status = PaymentViewStatusSchema.enum.CANCELLED
  } else if (latestAttempt?.status === "EXPIRED") {
    status = PaymentViewStatusSchema.enum.EXPIRED
  } else if (latestAttempt?.status === "FAILED") {
    status = PaymentViewStatusSchema.enum.FAILED
  }

  const hasFinancialActivity = hasPendingRefund || capturedAmountOre > 0 || hasAuthorization || status === "PROCESSING"

  if (isWaived && !hasFinancialActivity) {
    status = "WAIVED"
  }

  const isCheckoutActive = latestAttempt?.status === "CREATED" || latestAttempt?.status === "CHECKOUT_OPEN"
  const canStartCheckout =
    !isWaived && !hasOutstandingCapture && !hasAuthorization && !hasPendingRefund && status !== "PROCESSING"

  const refundedAt = successfulRefunds.reduce<Date | null>((latestDate, refund) => {
    if (latestDate === null || isAfter(refund.createdAt, latestDate)) {
      return refund.createdAt
    }

    return latestDate
  }, null)

  const stripePaymentIntentId = latestAttempt?.stripePaymentIntentId ?? null
  const stripeDashboardUrl =
    stripePaymentIntentId === null ? null : `https://dashboard.stripe.com/payments/${stripePaymentIntentId}`

  const isRequirementSatisfied =
    isWaived || payment.amountOre === 0 || hasAuthorization || (paidAmountOre >= payment.amountOre && !hasPendingRefund)

  const checkoutUrl = isCheckoutActive && !isWaived ? (latestAttempt?.checkoutUrl ?? null) : null

  return {
    id: payment.id,
    amountOre: payment.amountOre,
    description: payment.description,
    status,
    isRequirementSatisfied,
    canStartCheckout,
    canRefund: hasOutstandingCapture && !hasPendingRefund,
    canCancel: isCheckoutActive || hasAuthorization,
    canWaive: !isWaived && status !== "PROCESSING",
    checkoutUrl,
    stripeDashboardUrl,
    attemptId: latestAttempt?.id ?? null,
    captureScheduledAt: latestAttempt?.captureScheduledAt ?? null,
    refundedAt,
    refundedAmountOre,
    paidAmountOre,
    waivedAt: payment.waivedAt,
  }
}
