import { PaginateInputSchema } from "@dotkomonline/core"
import { PaymentSchema, RefundRequestSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const refundRequestRouter = t.router({
  create: protectedProcedure
    .input(
      z.object({
        paymentId: PaymentSchema.shape.id,
        reason: z.string().min(0).max(255),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.refundRequestService.createRefundRequest(input.paymentId, ctx.principal, input.reason)
    ),
  edit: protectedProcedure
    .input(z.object({ id: RefundRequestSchema.shape.id, reason: z.string().min(0).max(255) }))
    .mutation(async ({ input, ctx }) => ctx.refundRequestService.updateRefundRequest(input.id, input)),
  approve: protectedProcedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) => ctx.refundRequestService.approveRefundRequest(input, ctx.principal)),
  reject: protectedProcedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) => ctx.refundRequestService.rejectRefundRequest(input, ctx.principal)),
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
