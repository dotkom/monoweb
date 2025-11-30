import type { S3Client } from "@aws-sdk/client-s3"
import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { DBHandle } from "@dotkomonline/db"
import type { Company, CompanyId, CompanySlug, CompanyWrite, UserId } from "@dotkomonline/types"
import { createS3PresignedPost, slugify } from "@dotkomonline/utils"
import { NotFoundError } from "../../error"
import type { Pageable } from "../../query"
import type { CompanyRepository } from "./company-repository"

export interface CompanyService {
  findById(handle: DBHandle, companyId: CompanyId): Promise<Company | null>
  /**
   * Get a company by its id
   *
   * @throws {NotFoundError} if the company does not exist
   */
  getById(handle: DBHandle, companyId: CompanyId): Promise<Company>
  findBySlug(handle: DBHandle, companySlug: CompanySlug): Promise<Company | null>
  /**
   * Get a company by its slug
   *
   * @throws {NotFoundError} if the company does not exist
   */
  getBySlug(handle: DBHandle, companySlug: CompanySlug): Promise<Company>
  findMany(handle: DBHandle, page: Pageable): Promise<Company[]>
  create(handle: DBHandle, data: CompanyWrite): Promise<Company>
  /**
   * Update an existing company
   *
   * @throws {NotFoundError} if the company does not exist
   */
  update(handle: DBHandle, companyId: CompanyId, data: Partial<CompanyWrite>): Promise<Company>
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
    async findById(handle, companyId) {
      const company = await companyRepository.findById(handle, companyId)
      return company
    },

    async getById(handle, companyId) {
      const company = await this.findById(handle, companyId)
      if (!company) {
        throw new NotFoundError(`Company(ID=${companyId}) not found`)
      }
      return company
    },

    async findBySlug(handle, companySlug) {
      const company = await companyRepository.findBySlug(handle, companySlug)
      return company
    },

    async getBySlug(handle, companySlug) {
      const company = await companyRepository.findBySlug(handle, companySlug)
      if (!company) {
        throw new NotFoundError(`Company(Slug=${companySlug}) not found`)
      }
      return company
    },

    async findMany(handle, page) {
      return await companyRepository.findMany(handle, page)
    },

    async create(handle, payload) {
      return await companyRepository.create(handle, payload)
    },

    async update(handle, companyId, payload): Promise<Company> {
      return await companyRepository.update(handle, companyId, payload)
    },

    async createFileUpload(handle, filename, contentType, createdByUserId) {
      const uuid = crypto.randomUUID()
      const key = `company/${Date.now()}-${uuid}-${slugify(filename)}`

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
