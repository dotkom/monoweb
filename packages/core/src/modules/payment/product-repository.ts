import type { DBHandle, Prisma } from "@dotkomonline/db"
import type { Product, ProductId, ProductWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

const includePaymentProviders = {
  paymentProviders: {
    omit: { productId: true },
  },
} satisfies Prisma.ProductInclude

export interface ProductRepository {
  create(handle: DBHandle, data: ProductWrite): Promise<Product>
  update(handle: DBHandle, productId: ProductId, data: ProductWrite): Promise<Product>
  getById(handle: DBHandle, productId: ProductId): Promise<Product | null>
  getAll(handle: DBHandle, page: Pageable): Promise<Product[]>
  delete(handle: DBHandle, productId: ProductId): Promise<void>
  undelete(handle: DBHandle, productId: ProductId): Promise<void>
}

export function getProductRepository(): ProductRepository {
  return {
    async create(handle, data) {
      return await handle.product.create({ data, include: includePaymentProviders })
    },
    async update(handle, productId, data) {
      return await handle.product.update({ where: { id: productId }, data, include: includePaymentProviders })
    },
    async getById(handle, productId) {
      return await handle.product.findUnique({ where: { id: productId }, include: includePaymentProviders })
    },
    async getAll(handle, page) {
      return await handle.product.findMany({ include: includePaymentProviders, ...pageQuery(page) })
    },
    async delete(handle, productId) {
      await handle.product.update({ data: { deletedAt: new Date() }, where: { id: productId } })
    },
    async undelete(handle, productId) {
      await handle.product.update({ data: { deletedAt: null }, where: { id: productId } })
    },
  }
}
