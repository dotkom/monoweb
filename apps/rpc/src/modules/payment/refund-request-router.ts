import { PaymentSchema, RefundRequestSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { authenticatedProcedure, procedure, t } from "../../trpc"

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
  edit: procedure
    .input(z.object({ id: RefundRequestSchema.shape.id, reason: z.string().min(0).max(255) }))
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.refundRequestService.updateRefundRequest(handle, input.id, input))
    ),
  approve: authenticatedProcedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.refundRequestService.approveRefundRequest(handle, input, ctx.principal.subject)
      )
    ),
  reject: authenticatedProcedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.refundRequestService.rejectRefundRequest(handle, input, ctx.principal.subject)
      )
    ),
  delete: procedure
    .input(RefundRequestSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.refundRequestService.deleteRefundRequest(handle, input))
    ),
  get: procedure
    .input(RefundRequestSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.refundRequestService.getRefundRequestById(handle, input))
    ),
  all: procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.refundRequestService.getRefundRequests(handle, input))
    ),
})
