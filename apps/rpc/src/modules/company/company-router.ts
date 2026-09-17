import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { BasePaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isCommitteeMember } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { CompanyFilterQuerySchema, CompanySchema, CompanyWriteSchema } from "./company"

export type CreateCompanyInput = inferProcedureInput<typeof createCompanyProcedure>
export type CreateCompanyOutput = inferProcedureOutput<typeof createCompanyProcedure>
const createCompanyProcedure = procedure
  .input(CompanyWriteSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
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
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.companyService.update(ctx.handle, input.id, input.input)
  })

export type FindManyCompaniesInput = inferProcedureInput<typeof findManyCompaniesProcedure>
export type FindManyCompaniesOutput = inferProcedureOutput<typeof findManyCompaniesProcedure>
const findManyCompaniesProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: CompanyFilterQuerySchema.optional() }).prefault({}))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { filter, ...page } = input
    const companies = await ctx.companyService.findMany(ctx.handle, { ...filter }, page)

    return {
      items: companies,
      nextCursor: companies.at(-1)?.id,
    }
  })

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
  .use(withAuthorization(isCommitteeMember()))
  .mutation(async ({ ctx, input }) => {
    return ctx.companyService.createFileUpload(input.filename, input.contentType, ctx.principal.subject)
  })

export const companyRouter = t.router({
  create: createCompanyProcedure,
  edit: editCompanyProcedure,
  findMany: findManyCompaniesProcedure,
  findById: findCompanyByIdProcedure,
  getById: getCompanyByIdProcedure,
  findBySlug: findCompanyBySlugProcedure,
  getBySlug: getCompanyBySlugProcedure,
  createFileUpload: createCompanyFileUploadProcedure,
})
