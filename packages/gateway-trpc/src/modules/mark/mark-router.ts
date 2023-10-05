import { MarkWriteSchema } from "@dotkomonline/types";
import { PaginateInputSchema } from "@dotkomonline/core";
import { personalMarkRouter } from "./personal-mark-router";
import { protectedProcedure } from "./../../trpc";
import { t } from "../../trpc";
import { z } from "zod";

export const markRouter = t.router({
    personal: personalMarkRouter,
    create: protectedProcedure
        .input(MarkWriteSchema)
        .mutation(async ({ input, ctx }) => ctx.markService.createMark(input)),
    edit: protectedProcedure
        .input(MarkWriteSchema.required({ id: true }))
        .mutation(async ({ input: changes, ctx }) => ctx.markService.updateMark(changes.id, changes)),
    all: protectedProcedure
        .input(PaginateInputSchema)
        .query(async ({ input, ctx }) => ctx.markService.getMarks(input.take, input.cursor)),
    getByUser: protectedProcedure
        .input(z.object({ id: z.string().uuid(), paginate: PaginateInputSchema }))
        .query(async ({ input, ctx }) =>
            ctx.personalMarkService.getMarksForUserId(input.id, input.paginate.take, input.paginate.cursor)
        ),
    get: protectedProcedure.input(z.string().uuid()).query(async ({ input, ctx }) => ctx.markService.getMark(input)),
    delete: protectedProcedure
        .input(z.string().uuid())
        .mutation(async ({ input, ctx }) => ctx.markService.deleteMark(input)),
});
