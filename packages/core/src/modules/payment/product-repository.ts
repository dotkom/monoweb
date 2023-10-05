import { ProductSchema, type Product, type ProductWrite } from "@dotkomonline/types";
import { sql, type Kysely, type Selectable } from "kysely";
import { paginateQuery, type Cursor } from "../../utils/db-utils";

import { type Database } from "@dotkomonline/db";
import { type ProductPaymentProviderTable } from "@dotkomonline/db/src/types/payment";

const mapToProduct = (data: Selectable<Database["product"]>) => ProductSchema.parse({ paymentProviders: [], ...data });

export interface ProductRepository {
    create(data: ProductWrite): Promise<Product | undefined>;
    update(id: Product["id"], data: Omit<ProductWrite, "id">): Promise<Product>;
    getById(id: string): Promise<Product | undefined>;
    getAll(take: number, cursor?: Cursor): Promise<Array<Product>>;
    delete(id: Product["id"]): Promise<void>;
    undelete(id: Product["id"]): Promise<void>;
}

export class ProductRepositoryImpl implements ProductRepository {
    public constructor(private readonly db: Kysely<Database>) {}

    public async create(data: ProductWrite): Promise<Product | undefined> {
        const product = await this.db.insertInto("product").values(data).returningAll().executeTakeFirstOrThrow();

        return mapToProduct(product);
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

    public async delete(id: Product["id"]): Promise<void> {
        // Soft delete since we don't want payments to ever be deleted or miss context
        await this.db.updateTable("product").set({ deletedAt: new Date() }).where("id", "=", id).execute();
    }

    public async undelete(id: Product["id"]): Promise<void> {
        await this.db.updateTable("product").set({ deletedAt: null }).where("id", "=", id).execute();
    }
}
