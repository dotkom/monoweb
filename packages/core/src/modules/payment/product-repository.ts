import type { DBClient } from "@dotkomonline/db"
import type { Product, ProductId, ProductWrite } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "../../query"

export interface ProductRepository {
  create(data: ProductWrite): Promise<Product>
  update(productId: ProductId, data: ProductWrite): Promise<Product>
  getById(productId: ProductId): Promise<Product | null>
  getAll(page: Pageable): Promise<Product[]>
  delete(productId: ProductId): Promise<void>
  undelete(productId: ProductId): Promise<void>
}

export class ProductRepositoryImpl implements ProductRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async create(data: ProductWrite) {
    return await this.db.product.create({ data, include: { paymentProviders: true } })
  }

  public async update(productId: ProductId, data: ProductWrite) {
    return await this.db.product.update({ where: { id: productId }, data, include: { paymentProviders: true } })
  }

  public async getById(productId: ProductId) {
    return await this.db.product.findUnique({ where: { id: productId }, include: { paymentProviders: true } })
  }

  public async getAll(page: Pageable) {
    return await this.db.product.findMany({ include: { paymentProviders: true }, ...pageQuery(page) })
  }

  public async delete(productId: ProductId) {
    await this.db.product.update({ data: { deletedAt: new Date() }, where: { id: productId } })
  }

  public async undelete(productId: ProductId) {
    await this.db.product.update({ data: { deletedAt: null }, where: { id: productId } })
  }
}
