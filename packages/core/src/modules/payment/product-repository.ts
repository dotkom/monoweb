import type { DBClient } from "@dotkomonline/db"
import { type Product, type ProductId, ProductSchema, type ProductWrite } from "@dotkomonline/types"

export interface ProductRepository {
  create(data: ProductWrite): Promise<Product>
  update(id: ProductId, data: ProductWrite): Promise<Product>
  getById(id: string): Promise<Product | null>
  getAll(take: number): Promise<Product[]>
  delete(id: ProductId): Promise<void>
  undelete(id: ProductId): Promise<void>
}

export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly db: DBClient) {}

  async create(data: ProductWrite): Promise<Product> {
    return await this.db.product.create({ data, include: { paymentProviders: true } })
  }

  async update(id: ProductId, data: ProductWrite): Promise<Product> {
    return await this.db.product.update({ where: { id }, data, include: { paymentProviders: true } })
  }

  async getById(id: string): Promise<Product | null> {
    return await this.db.product.findUnique({ where: { id }, include: { paymentProviders: true} })
  }

  async getAll(take: number): Promise<Product[]> {
    return await this.db.product.findMany({ take, include: { paymentProviders: true } })
  }

  async delete(id: ProductId): Promise<void> {
    await this.db.product.update({ data: { deletedAt: new Date() }, where: { id } })
  }

  async undelete(id: ProductId): Promise<void> {
    await this.db.product.update({ data: { deletedAt: null }, where: { id } })
  }
}
