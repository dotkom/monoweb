import { isAdministrator } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { FeatureSchema, FeatureWriteSchema } from "./feature"
import { z } from "zod"

const activeFeaturesProcedure = procedure
  .output(z.array(FeatureSchema))
  .use(withDatabaseTransaction())
  .query(({ ctx }) => ctx.featureService.findActive(ctx.handle))

const allFeaturesProcedure = procedure
  .output(z.array(FeatureSchema))
  .use(withAuthentication())
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .query(({ ctx }) => ctx.featureService.findMany(ctx.handle))

const updateFeatureProcedure = procedure
  .input(FeatureWriteSchema)
  .output(FeatureSchema)
  .use(withAuthentication())
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(({ input, ctx }) => ctx.featureService.update(ctx.handle, input))

export const featureRouter = t.router({
  active: activeFeaturesProcedure,
  all: allFeaturesProcedure,
  update: updateFeatureProcedure,
})
