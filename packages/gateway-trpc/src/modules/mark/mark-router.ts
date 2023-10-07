import { PaginateInputSchema } from "@dotkomonline/core";
import { MarkWriteSchema } from "@dotkomonline/types";
import { z } from "zod";

import { t } from "../../trpc";
import { protectedProcedure } from "./../../trpc";
import { personalMarkRouter } from "./personal-mark-router";

export const markRouter = t.router({
  all: protectedProcedure
    .input(PaginateInputSchema)
    .query(async ({ ctx, input }) => ctx.markService.getMarks(input.take, input.cursor)),
  create: protectedProcedure
    .input(MarkWriteSchema)
    .mutation(async ({ ctx, input }) => ctx.markService.createMark(input)),
  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => ctx.markService.deleteMark(input)),
  edit: protectedProcedure
    .input(MarkWriteSchema.required({ id: true }))
    .mutation(async ({ ctx, input: changes }) => ctx.markService.updateMark(changes.id, changes)),
  get: protectedProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => ctx.markService.getMark(input)),
  getByUser: protectedProcedure
    .input(z.object({ id: z.string().uuid(), paginate: PaginateInputSchema }))
    .query(async ({ ctx, input }) =>
      ctx.personalMarkService.getMarksForUserId(input.id, input.paginate.take, input.paginate.cursor)
    ),
  personal: personalMarkRouter,
});
