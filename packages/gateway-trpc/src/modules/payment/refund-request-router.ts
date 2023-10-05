import { PaginateInputSchema } from "@dotkomonline/core";
import { protectedProcedure } from "../../trpc";
import { t } from "../../trpc";
import { z } from "zod";

export const refundRequestRouter = t.router({
    create: protectedProcedure
        .input(
            z.object({
                paymentId: z.string().uuid(),
                reason: z.string().min(0).max(255),
            })
        )
        .mutation(async ({ input, ctx }) =>
            ctx.refundRequestService.createRefundRequest(input.paymentId, ctx.auth.userId, input.reason)
        ),
    edit: protectedProcedure
        .input(z.object({ id: z.string().uuid(), reason: z.string().min(0).max(255) }))
        .mutation(async ({ input, ctx }) => ctx.refundRequestService.updateRefundRequest(input.id, input)),
    approve: protectedProcedure
        .input(z.string().uuid())
        .mutation(async ({ input, ctx }) => ctx.refundRequestService.approveRefundRequest(input, ctx.auth.userId)),
    reject: protectedProcedure
        .input(z.string().uuid())
        .mutation(async ({ input, ctx }) => ctx.refundRequestService.rejectRefundRequest(input, ctx.auth.userId)),
    delete: protectedProcedure
        .input(z.string().uuid())
        .mutation(async ({ input, ctx }) => ctx.refundRequestService.deleteRefundRequest(input)),
    get: protectedProcedure
        .input(z.string().uuid())
        .query(async ({ input, ctx }) => ctx.refundRequestService.getRefundRequestById(input)),
    all: protectedProcedure
        .input(PaginateInputSchema)
        .query(async ({ input, ctx }) => ctx.refundRequestService.getRefundRequests(input.take, input.cursor)),
});
