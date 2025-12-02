import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { CompanySchema, CompanyWriteSchema } from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isEditor } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { PaginateInputSchema } from "../../query"
import { procedure, t } from "../../trpc"

export type CreateCompanyInput = inferProcedureInput<typeof createCompanyProcedure>
export type CreateCompanyOutput = inferProcedureOutput<typeof createCompanyProcedure>
const createCompanyProcedure = procedure
  .input(CompanyWriteSchema)
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.companyService.create(ctx.handle, input)
  })

export type EditCompanyInput = inferProcedureInput<typeof editCompanyProcedure>
export type EditCompanyOutput = inferProcedureOutput<typeof editCompanyProcedure>
const editCompanyProcedure = procedure
  .input(
    z.object({
      id: CompanySchema.shape.id,
      input: CompanyWriteSchema,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.companyService.update(ctx.handle, input.id, input.input)
  })

export type AllCompaniesInput = inferProcedureInput<typeof allCompaniesProcedure>
export type AllCompaniesOutput = inferProcedureOutput<typeof allCompaniesProcedure>
const allCompaniesProcedure = procedure
  .input(PaginateInputSchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.companyService.findMany(ctx.handle, input))

export type FindCompanyByIdInput = inferProcedureInput<typeof findCompanyByIdProcedure>
export type FindCompanyByIdOutput = inferProcedureOutput<typeof findCompanyByIdProcedure>
const findCompanyByIdProcedure = procedure
  .input(CompanySchema.shape.id)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.companyService.findById(ctx.handle, input))

export type GetCompanyByIdInput = inferProcedureInput<typeof getCompanyByIdProcedure>
export type GetCompanyByIdOutput = inferProcedureOutput<typeof getCompanyByIdProcedure>
const getCompanyByIdProcedure = procedure
  .input(CompanySchema.shape.id)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.companyService.getById(ctx.handle, input))

export type FindCompanyBySlugInput = inferProcedureInput<typeof findCompanyBySlugProcedure>
export type FindCompanyBySlugOutput = inferProcedureOutput<typeof findCompanyBySlugProcedure>
const findCompanyBySlugProcedure = procedure
  .input(CompanySchema.shape.slug)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.companyService.findBySlug(ctx.handle, input))

export type GetCompanyBySlugInput = inferProcedureInput<typeof getCompanyBySlugProcedure>
export type GetCompanyBySlugOutput = inferProcedureOutput<typeof getCompanyBySlugProcedure>
const getCompanyBySlugProcedure = procedure
  .input(CompanySchema.shape.slug)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.companyService.getBySlug(ctx.handle, input))

export type CreateCompanyFileUploadInput = inferProcedureInput<typeof createCompanyFileUploadProcedure>
export type CreateCompanyFileUploadOutput = inferProcedureOutput<typeof createCompanyFileUploadProcedure>
const createCompanyFileUploadProcedure = procedure
  .input(
    z.object({
      filename: z.string(),
      contentType: z.string(),
    })
  )
  .output(z.custom<PresignedPost>())
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ ctx, input }) => {
    return ctx.companyService.createFileUpload(ctx.handle, input.filename, input.contentType, ctx.principal.subject)
  })

export const companyRouter = t.router({
  create: createCompanyProcedure,
  edit: editCompanyProcedure,
  all: allCompaniesProcedure,
  findById: findCompanyByIdProcedure,
  getById: getCompanyByIdProcedure,
  findBySlug: findCompanyBySlugProcedure,
  getBySlug: getCompanyBySlugProcedure,
  createFileUpload: createCompanyFileUploadProcedure,
})
