import { Cursor, paginateQuery } from "../../utils/db-utils"
import { Kysely, Selectable, sql } from "kysely"
import { Product, ProductSchema, ProductWrite } from "@dotkomonline/types"

import { Database } from "@dotkomonline/db"
import { DB } from "@dotkomonline/db/src/db.generated"

const mapToProduct = (data: Selectable<Database["product"]>) => ProductSchema.parse({ paymentProviders: [], ...data })

export interface ProductRepository {
  create(data: ProductWrite): Promise<Product | undefined>
  update(id: Product["id"], data: Omit<ProductWrite, "id">): Promise<Product>
  getById(id: string): Promise<Product | undefined>
  getAll(take: number, cursor?: Cursor): Promise<Product[]>
  delete(id: Product["id"]): Promise<void>
  undelete(id: Product["id"]): Promise<void>
}

export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async create(data: ProductWrite): Promise<Product | undefined> {
    const product = await this.db.insertInto("product").values(data).returningAll().executeTakeFirstOrThrow()

    return mapToProduct(product)
  }

  async update(id: Product["id"], data: Omit<ProductWrite, "id">): Promise<Product> {
    const product = await this.db
      .updateTable("product")
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return mapToProduct(product)
  }

  async getById(id: string): Promise<Product | undefined> {
    const product = await this.db
      .selectFrom("product")
      .leftJoin("productPaymentProvider", "product.id", "productPaymentProvider.productId")
      .selectAll("product")
      .select(
        sql<
          DB["productPaymentProvider"][]
        >`COALESCE(json_agg(product_payment_provider) FILTER (WHERE product_payment_provider.product_id IS NOT NULL), '[]')`.as(
          "paymentProviders"
        )
      )
      .groupBy("product.id")
      .where("id", "=", id)
      .executeTakeFirst()

    return product ? mapToProduct(product) : undefined
  }

  async getAll(take: number, cursor?: Cursor): Promise<Product[]> {
    let query = this.db
      .selectFrom("product")
      .leftJoin("productPaymentProvider", "product.id", "productPaymentProvider.productId")
      .selectAll("product")
      .select(
        sql<
          DB["productPaymentProvider"][]
        >`COALESCE(json_agg(product_payment_provider) FILTER (WHERE product_payment_provider.product_id IS NOT NULL), '[]')`.as(
          "paymentProviders"
        )
      )
      .groupBy("product.id")
      .limit(take)

    if (cursor) {
      query = paginateQuery(query, cursor)
    } else {
      query = query.orderBy("id", "desc")
    }

    const products = await query.execute()
    return products.map(mapToProduct)
  }

  async delete(id: Product["id"]): Promise<void> {
    // Soft delete since we don't want payments to ever be deleted or miss context
    await this.db.updateTable("product").set({ deletedAt: new Date() }).where("id", "=", id).execute()
  }

  async undelete(id: Product["id"]): Promise<void> {
    await this.db.updateTable("product").set({ deletedAt: null }).where("id", "=", id).execute()
  }
}
