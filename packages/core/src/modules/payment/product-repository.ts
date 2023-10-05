import { type Database } from "@dotkomonline/db";
import { type ProductPaymentProviderTable } from "@dotkomonline/db/src/types/payment";
import { type Product, ProductSchema, type ProductWrite } from "@dotkomonline/types";
import { type Kysely, type Selectable, sql } from "kysely";

import { type Cursor, paginateQuery } from "../../utils/db-utils";

const mapToProduct = (data: Selectable<Database["product"]>) => ProductSchema.parse({ paymentProviders: [], ...data });

export interface ProductRepository {
    create(data: ProductWrite): Promise<Product | undefined>;
    delete(id: Product["id"]): Promise<void>;
    getAll(take: number, cursor?: Cursor): Promise<Array<Product>>;
    getById(id: string): Promise<Product | undefined>;
    undelete(id: Product["id"]): Promise<void>;
    update(id: Product["id"], data: Omit<ProductWrite, "id">): Promise<Product>;
}

export class ProductRepositoryImpl implements ProductRepository {
    public constructor(private readonly db: Kysely<Database>) {}

    public async create(data: ProductWrite): Promise<Product | undefined> {
        const product = await this.db.insertInto("product").values(data).returningAll().executeTakeFirstOrThrow();

        return mapToProduct(product);
    }

    public async delete(id: Product["id"]): Promise<void> {
        // Soft delete since we don't want payments to ever be deleted or miss context
        await this.db.updateTable("product").set({ deletedAt: new Date() }).where("id", "=", id).execute();
    }

    public async getAll(take: number, cursor?: Cursor): Promise<Array<Product>> {
        let query = this.db
            .selectFrom("product")
            .leftJoin("productPaymentProvider", "product.id", "productPaymentProvider.productId")
            .selectAll("product")
            .select(
                sql<
                    Array<ProductPaymentProviderTable>
                >`COALESCE(json_agg(product_payment_provider) FILTER (WHERE product_payment_provider.product_id IS NOT NULL), '[]')`.as(
                    "paymentProviders"
                )
            )
            .groupBy("product.id")
            .limit(take);

        if (cursor) {
            query = paginateQuery(query, cursor);
        } else {
            query = query.orderBy("createdAt", "desc").orderBy("id", "desc");
        }

        const products = await query.execute();

        return products.map(mapToProduct);
    }

    public async getById(id: string): Promise<Product | undefined> {
        const product = await this.db
            .selectFrom("product")
            .leftJoin("productPaymentProvider", "product.id", "productPaymentProvider.productId")
            .selectAll("product")
            .select(
                sql<
                    Array<ProductPaymentProviderTable>
                >`COALESCE(json_agg(product_payment_provider) FILTER (WHERE product_payment_provider.product_id IS NOT NULL), '[]')`.as(
                    "paymentProviders"
                )
            )
            .groupBy("product.id")
            .where("id", "=", id)
            .executeTakeFirst();

        return product ? mapToProduct(product) : undefined;
    }

    public async undelete(id: Product["id"]): Promise<void> {
        await this.db.updateTable("product").set({ deletedAt: null }).where("id", "=", id).execute();
    }

    public async update(id: Product["id"], data: Omit<ProductWrite, "id">): Promise<Product> {
        const product = await this.db
            .updateTable("product")
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where("id", "=", id)
            .returningAll()
            .executeTakeFirstOrThrow();

        return mapToProduct(product);
    }
}
