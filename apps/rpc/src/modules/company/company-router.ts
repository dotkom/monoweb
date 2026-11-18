import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { BasePaginateInputSchema } from "@dotkomonline/utils"
import { z } from "zod"
import { permitIf } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { canManageCompanies } from "../../permissions/company-permissions"
import { procedure, t } from "../../trpc"
import { CompanyFilterQuerySchema, CompanySchema, CompanyWriteSchema } from "./company"

const createCompanyProcedure = procedure
  .input(CompanyWriteSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canManageCompanies)))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const createdCompany = await ctx.companyService.create(ctx.handle, input)

    ctx.setAuditTransactionName(`Create Company(ID=${createdCompany.id},Name=${createdCompany.name})`)

    return createdCompany
  })

const editCompanyProcedure = procedure
  .input(
    z.object({
      id: CompanySchema.shape.id,
      input: CompanyWriteSchema,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canManageCompanies)))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const updatedCompany = await ctx.companyService.update(ctx.handle, input.id, input.input)

    ctx.setAuditTransactionName(`Update Company(ID=${updatedCompany.id},Name=${updatedCompany.name})`)

    return updatedCompany
  })

const findManyCompaniesProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: CompanyFilterQuerySchema.optional() }).prefault({}))
  .query(async ({ input, ctx }) => {
    const { filter, ...page } = input
    const companies = await ctx.companyService.findMany(ctx.prisma, { ...filter }, page)

    return {
      items: companies,
      nextCursor: companies.at(-1)?.id,
    }
  })

const findCompanyByIdProcedure = procedure
  .input(CompanySchema.shape.id)
  .query(async ({ input, ctx }) => ctx.companyService.findById(ctx.prisma, input))

const getCompanyByIdProcedure = procedure
  .input(CompanySchema.shape.id)
  .query(async ({ input, ctx }) => ctx.companyService.getById(ctx.prisma, input))

const findCompanyBySlugProcedure = procedure
  .input(CompanySchema.shape.slug)
  .query(async ({ input, ctx }) => ctx.companyService.findBySlug(ctx.prisma, input))

const getCompanyBySlugProcedure = procedure
  .input(CompanySchema.shape.slug)
  .query(async ({ input, ctx }) => ctx.companyService.getBySlug(ctx.prisma, input))

const createCompanyFileUploadProcedure = procedure
  .input(
    z.object({
      filename: z.string(),
      contentType: z.string(),
    })
  )
  .output(z.custom<PresignedPost>())
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canManageCompanies)))
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
