import { PaginateInputSchema } from "@dotkomonline/core"
import { PaymentSchema, RefundRequestSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, t } from "../../trpc"

export const refundRequestRouter = t.router({
  create: adminProcedure
    .input(
      z.object({
        paymentId: PaymentSchema.shape.id,
        reason: z.string().min(0).max(255),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.refundRequestService.createRefundRequest(input.paymentId, ctx.principal, input.reason)
    ),
  edit: adminProcedure
    .input(z.object({ id: RefundRequestSchema.shape.id, reason: z.string().min(0).max(255) }))
    .mutation(async ({ input, ctx }) => ctx.refundRequestService.updateRefundRequest(input.id, input)),
  approve: adminProcedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) => ctx.refundRequestService.approveRefundRequest(input, ctx.principal)),
  reject: adminProcedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) => ctx.refundRequestService.rejectRefundRequest(input, ctx.principal)),
  delete: adminProcedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) => ctx.refundRequestService.deleteRefundRequest(input)),
  get: adminProcedure
    .input(RefundRequestSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.refundRequestService.getRefundRequestById(input)),
  all: adminProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.refundRequestService.getRefundRequests(input)),
})
