import type { inferProcedureOutput } from "@trpc/server"
import { procedure, t } from "../../trpc"
import { ProductStockSchema } from "./zettle"

export type GetProductStockOutput = inferProcedureOutput<typeof getProductStockProcedure>
const getProductStockProcedure = procedure.output(ProductStockSchema.array()).query(async ({ ctx }) => {
  return await ctx.zettleService.getProductStock()
})

export const zettleRouter = t.router({
  getProductStock: getProductStockProcedure,
})
