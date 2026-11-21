import type { inferProcedureOutput } from "@trpc/server"
import { procedure, t } from "../../trpc"
import { ProductStockSchema } from "./kiosk"

export type GetProductStockOutput = inferProcedureOutput<typeof getProductStockProcedure>
const getProductStockProcedure = procedure.output(ProductStockSchema.array()).query(async ({ ctx }) => {
  return await ctx.kioskService.getProductStock()
})

export const kioskRouter = t.router({
  getProductStock: getProductStockProcedure,
})
