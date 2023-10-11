import { PaginateInputSchema } from "@dotkomonline/core"
import { protectedProcedure } from "../../trpc"
import { t } from "../../trpc"
import { z } from "zod"
import { PaymentSchema, RefundRequestSchema } from "@dotkomonline/types"

export const refundRequestRouter = t.router({
  create: protectedProcedure
    .input(
      z.object({
        paymentId: PaymentSchema.shape.id,
        reason: z.string().min(0).max(255),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.refundRequestService.createRefundRequest(input.paymentId, ctx.auth.userId, input.reason)
    }),
  edit: protectedProcedure
    .input(z.object({ id: RefundRequestSchema.shape.id, reason: z.string().min(0).max(255) }))
    .mutation(({ input, ctx }) => {
      return ctx.refundRequestService.updateRefundRequest(input.id, input)
    }),
  approve: protectedProcedure.input(RefundRequestSchema.shape.id).mutation(({ input, ctx }) => {
    return ctx.refundRequestService.approveRefundRequest(input, ctx.auth.userId)
  }),
  reject: protectedProcedure.input(RefundRequestSchema.shape.id).mutation(({ input, ctx }) => {
    return ctx.refundRequestService.rejectRefundRequest(input, ctx.auth.userId)
  }),
  delete: protectedProcedure.input(RefundRequestSchema.shape.id).mutation(({ input, ctx }) => {
    return ctx.refundRequestService.deleteRefundRequest(input)
  }),
  get: protectedProcedure.input(RefundRequestSchema.shape.id).query(({ input, ctx }) => {
    return ctx.refundRequestService.getRefundRequestById(input)
  }),
  all: protectedProcedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.refundRequestService.getRefundRequests(input.take, input.cursor)
  }),
})
