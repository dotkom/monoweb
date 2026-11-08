import type { DBHandle, Prisma } from "@dotkomonline/db"
import { parseOrReport } from "../../invariant"
import {
  type PaymentAttempt,
  type PaymentAttemptIdentifiers,
  PaymentAttemptSchema,
  type PaymentAttemptUpdate,
  type PaymentAttemptWrite,
  type PaymentRecord,
  PaymentRecordSchema,
  type PaymentRefund,
  PaymentRefundSchema,
  type PaymentRefundUpdate,
  type PaymentRefundWrite,
  type PaymentUpdate,
  type PaymentWrite,
} from "./payment"

export const paymentInclude = {
  attempts: {
    include: {
      refunds: true,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
  },
} satisfies Prisma.PaymentInclude

export interface PaymentRepository {
  create(handle: DBHandle, data: PaymentWrite): Promise<PaymentRecord>
  update(handle: DBHandle, paymentId: string, data: PaymentUpdate): Promise<PaymentRecord>
  findById(handle: DBHandle, paymentId: string): Promise<PaymentRecord | null>
  findByAttendeeId(handle: DBHandle, attendeeId: string): Promise<PaymentRecord | null>
  findByAttemptId(handle: DBHandle, attemptId: string): Promise<PaymentRecord | null>
  reassignPayments(handle: DBHandle, consumedUserId: string, survivorUserId: string): Promise<void>
  reassignWaivers(handle: DBHandle, consumedUserId: string, survivorUserId: string): Promise<void>

  createAttempt(handle: DBHandle, data: PaymentAttemptWrite): Promise<PaymentAttempt>
  updateAttempt(handle: DBHandle, attemptId: string, data: PaymentAttemptUpdate): Promise<PaymentAttempt>
  findAttemptByIdentifiers(handle: DBHandle, identifiers: PaymentAttemptIdentifiers[]): Promise<PaymentAttempt | null>

  createRefund(handle: DBHandle, data: PaymentRefundWrite): Promise<PaymentRefund>
  updateRefund(handle: DBHandle, refundId: string, data: PaymentRefundUpdate): Promise<PaymentRefund>
  findUnlinkedRefund(handle: DBHandle, refundId: string, attemptId: string): Promise<PaymentRefund | null>
  upsertStripeRefund(handle: DBHandle, stripeRefundId: string, data: PaymentRefundWrite): Promise<PaymentRefund>
  reassignRefundRequests(handle: DBHandle, consumedUserId: string, survivorUserId: string): Promise<void>
}

export function getPaymentRepository(): PaymentRepository {
  return {
    async create(handle, data) {
      const payment = await handle.payment.create({
        data,
        include: paymentInclude,
      })

      return parseOrReport(PaymentRecordSchema, payment)
    },

    async update(handle, paymentId, data) {
      const payment = await handle.payment.update({
        where: {
          id: paymentId,
        },
        data,
        include: paymentInclude,
      })

      return parseOrReport(PaymentRecordSchema, payment)
    },

    async findById(handle, paymentId) {
      const payment = await handle.payment.findUnique({
        where: {
          id: paymentId,
        },
        include: paymentInclude,
      })

      return parseOrReport(PaymentRecordSchema.nullable(), payment)
    },

    async findByAttendeeId(handle, attendeeId) {
      const payment = await handle.payment.findUnique({
        where: {
          attendeeId,
        },
        include: paymentInclude,
      })

      return parseOrReport(PaymentRecordSchema.nullable(), payment)
    },

    async findByAttemptId(handle, attemptId) {
      const payment = await handle.payment.findFirst({
        where: {
          attempts: {
            some: {
              id: attemptId,
            },
          },
        },
        include: paymentInclude,
      })

      return parseOrReport(PaymentRecordSchema.nullable(), payment)
    },

    async reassignPayments(handle, consumedUserId, survivorUserId) {
      await handle.payment.updateMany({
        where: {
          userId: consumedUserId,
        },
        data: {
          userId: survivorUserId,
        },
      })
    },

    async reassignWaivers(handle, consumedUserId, survivorUserId) {
      await handle.payment.updateMany({
        where: {
          waivedByUserId: consumedUserId,
        },
        data: {
          waivedByUserId: survivorUserId,
        },
      })
    },

    async createAttempt(handle, data) {
      const attempt = await handle.paymentAttempt.create({
        data,
        include: {
          refunds: true,
        },
      })

      return parseOrReport(PaymentAttemptSchema, attempt)
    },

    async updateAttempt(handle, attemptId, data) {
      const attempt = await handle.paymentAttempt.update({
        where: {
          id: attemptId,
        },
        data,
        include: {
          refunds: true,
        },
      })

      return parseOrReport(PaymentAttemptSchema, attempt)
    },

    async findAttemptByIdentifiers(handle, identifiers) {
      if (identifiers.length === 0) {
        return null
      }

      const attempt = await handle.paymentAttempt.findFirst({
        where: {
          OR: identifiers,
        },
        include: {
          refunds: true,
        },
      })

      return parseOrReport(PaymentAttemptSchema.nullable(), attempt)
    },

    async createRefund(handle, data) {
      const refund = await handle.paymentRefund.create({
        data,
      })

      return parseOrReport(PaymentRefundSchema, refund)
    },

    async updateRefund(handle, refundId, data) {
      const refund = await handle.paymentRefund.update({
        where: {
          id: refundId,
        },
        data,
      })

      return parseOrReport(PaymentRefundSchema, refund)
    },

    async findUnlinkedRefund(handle, refundId, attemptId) {
      const refund = await handle.paymentRefund.findFirst({
        where: {
          id: refundId,
          paymentAttemptId: attemptId,
          stripeRefundId: null,
        },
      })

      return parseOrReport(PaymentRefundSchema.nullable(), refund)
    },

    async upsertStripeRefund(handle, stripeRefundId, data) {
      const refund = await handle.paymentRefund.upsert({
        where: {
          stripeRefundId,
        },
        create: {
          ...data,
          stripeRefundId,
        },
        update: {
          status: data.status,
          amountOre: data.amountOre,
        },
      })

      return parseOrReport(PaymentRefundSchema, refund)
    },

    async reassignRefundRequests(handle, consumedUserId, survivorUserId) {
      await handle.paymentRefund.updateMany({
        where: {
          requestedByUserId: consumedUserId,
        },
        data: {
          requestedByUserId: survivorUserId,
        },
      })
    },
  }
}
