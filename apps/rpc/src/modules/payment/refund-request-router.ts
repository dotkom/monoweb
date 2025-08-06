import { PaymentSchema, RefundRequestSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { authenticatedProcedure, staffProcedure, t } from "../../trpc"

export const refundRequestRouter = t.router({
  create: authenticatedProcedure
    .input(
      z.object({
        paymentId: PaymentSchema.shape.id,
        reason: z.string().min(0).max(255),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.refundRequestService.createRefundRequest(handle, input.paymentId, ctx.principal.subject, input.reason)
      )
    ),
  edit: staffProcedure
    .input(z.object({ id: RefundRequestSchema.shape.id, reason: z.string().min(0).max(255) }))
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.refundRequestService.updateRefundRequest(handle, input.id, input))
    ),
  approve: staffProcedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.refundRequestService.approveRefundRequest(handle, input, ctx.principal.subject)
      )
    ),
  reject: staffProcedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.refundRequestService.rejectRefundRequest(handle, input, ctx.principal.subject)
      )
    ),
  delete: staffProcedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.refundRequestService.deleteRefundRequest(handle, input))
    ),
  get: staffProcedure
    .input(RefundRequestSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.refundRequestService.getRefundRequestById(handle, input))
    ),
  all: staffProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.refundRequestService.getRefundRequests(handle, input))
    ),
})
