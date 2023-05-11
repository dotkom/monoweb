import { MarkWriteSchema } from '@dotkomonline/types';
import { protectedProcedure } from './../../trpc';
import { t } from "../../trpc";

export const markRouter = t.router({
  create: protectedProcedure.input(MarkWriteSchema).mutation(({ input, ctx }) => {
    return ctx.markService.createMark(input)
  }),
})
