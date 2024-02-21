import { PaginateInputSchema } from "@dotkomonline/core"
import { z } from "zod"
import { PaymentSchema, RefundRequestSchema } from "@dotkomonline/types"
import { t, protectedProcedure } from "../../trpc"

export const refundRequestRouter = t.router({
  create: protectedProcedure
    .input(
      z.object({
        paymentId: PaymentSchema.shape.id,
        reason: z.string().min(0).max(255),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.refundRequestService.createRefundRequest(input.paymentId, ctx.auth.userId, input.reason)
    ),
  edit: protectedProcedure
    .input(z.object({ id: RefundRequestSchema.shape.id, reason: z.string().min(0).max(255) }))
    .mutation(async ({ input, ctx }) => ctx.refundRequestService.updateRefundRequest(input.id, input)),
  approve: protectedProcedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) => ctx.refundRequestService.approveRefundRequest(input, ctx.auth.userId)),
  reject: protectedProcedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) => ctx.refundRequestService.rejectRefundRequest(input, ctx.auth.userId)),
  delete: protectedProcedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) => ctx.refundRequestService.deleteRefundRequest(input)),
  get: protectedProcedure
    .input(RefundRequestSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.refundRequestService.getRefundRequestById(input)),
  all: protectedProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.refundRequestService.getRefundRequests(input.take, input.cursor)),
})
