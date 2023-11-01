import { PaginateInputSchema } from "@dotkomonline/core"
import { WebshopPurchaseSchema, WebshopPurchaseWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const webshopPurchaseRouter = t.router({
  create: t.procedure.input(WebshopPurchaseWriteSchema).mutation(({ input, ctx }) => {
    return ctx.webshopPurchaseService.create(input)
  }),
  edit: protectedProcedure
    .input(
      z.object({
        id: WebshopPurchaseSchema.shape.id,
        input: WebshopPurchaseWriteSchema,
      })
    )
    .mutation(({ input: changes, ctx }) => {
      return ctx.webshopPurchaseService.update(changes.id, changes.input)
    }),
  all: t.procedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.webshopPurchaseService.getAll(input.take, input.cursor)
  }),
  get: t.procedure.input(WebshopPurchaseSchema.shape.id).query(({ input, ctx }) => {
    return ctx.webshopPurchaseService.get(input)
  }),
})
