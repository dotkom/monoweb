import type { S3Client } from "@aws-sdk/client-s3"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import type { Company, CompanyId, CompanyWrite, UserId } from "@dotkomonline/types"
import { createS3PresignedPost } from "@dotkomonline/utils"
import { NotFoundError } from "../../error"
import type { Pageable } from "../../query"
import type { CompanyRepository } from "./company-repository"

export interface CompanyService {
  /**
   * Get a company by its id
   *
   * @throws {NotFoundError} if the company does not exist
   */
  getCompanyById(handle: DBHandle, id: CompanyId): Promise<Company>
  /**
   * Get a company by its slug
   *
   * @throws {NotFoundError} if the company does not exist
   */
  getCompanyBySlug(handle: DBHandle, slug: string): Promise<Company>
  getCompanies(handle: DBHandle, page: Pageable): Promise<Company[]>
  createCompany(handle: DBHandle, payload: CompanyWrite): Promise<Company>
  /**
   * Update an existing company
   *
   * @throws {NotFoundError} if the company does not exist
   */
  updateCompany(handle: DBHandle, id: CompanyId, payload: CompanyWrite): Promise<Company>
  createFileUpload(
    handle: DBHandle,
    filename: string,
    contentType: string,
    createdByUserId: UserId
  ): Promise<PresignedPost>
}

export function getCompanyService(
  companyRepository: CompanyRepository,
  s3Client: S3Client,
  s3BucketName: string
): CompanyService {
  return {
    async getCompanyById(handle, id) {
      const company = await companyRepository.getById(handle, id)
      if (!company) {
        throw new NotFoundError(`Company(ID=${id}) not found`)
      }
      return company
    },
    async getCompanyBySlug(handle, slug) {
      const company = await companyRepository.getBySlug(handle, slug)
      if (!company) {
        throw new NotFoundError(`Company(Slug=${slug}) not found`)
      }
      return company
    },
    async getCompanies(handle, page) {
      return await companyRepository.getAll(handle, page)
    },
    async createCompany(handle, payload) {
      return await companyRepository.create(handle, payload)
    },
    async updateCompany(handle, id, payload): Promise<Company> {
      return await companyRepository.update(handle, id, payload)
    },
    async createFileUpload(handle, filename, contentType, createdByUserId) {
      const uuid = crypto.randomUUID()
      const key = `company/${Date.now()}-${uuid}-${filename}`

      const maxSizeKiB = 5 * 1024 // 5 MiB, arbitrarily set

      return await createS3PresignedPost(s3Client, {
        bucket: s3BucketName,
        key,
        maxSizeKiB,
        contentType,
        createdByUserId,
      })
    },
  }
}
