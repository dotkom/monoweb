import { PaginateInputSchema } from "@dotkomonline/core";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import { t } from "../../trpc";

export const refundRequestRouter = t.router({
  all: protectedProcedure
    .input(PaginateInputSchema)
    .query(async ({ ctx, input }) => ctx.refundRequestService.getRefundRequests(input.take, input.cursor)),
  approve: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => ctx.refundRequestService.approveRefundRequest(input, ctx.auth.userId)),
  create: protectedProcedure
    .input(
      z.object({
        paymentId: z.string().uuid(),
        reason: z.string().min(0).max(255),
      })
    )
    .mutation(async ({ ctx, input }) =>
      ctx.refundRequestService.createRefundRequest(input.paymentId, ctx.auth.userId, input.reason)
    ),
  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => ctx.refundRequestService.deleteRefundRequest(input)),
  edit: protectedProcedure
    .input(z.object({ id: z.string().uuid(), reason: z.string().min(0).max(255) }))
    .mutation(async ({ ctx, input }) => ctx.refundRequestService.updateRefundRequest(input.id, input)),
  get: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => ctx.refundRequestService.getRefundRequestById(input)),
  reject: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => ctx.refundRequestService.rejectRefundRequest(input, ctx.auth.userId)),
});
