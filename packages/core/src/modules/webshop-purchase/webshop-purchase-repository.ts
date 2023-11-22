import { type Database } from "@dotkomonline/db"
import { type Insertable, type Kysely, type Selectable } from "kysely"
import { type WebshopPurchase, type WebshopPurchaseId, WebshopPurchaseSchema } from "@dotkomonline/types"
import { type Cursor, orderedQuery } from "../../utils/db-utils"

type WebshopPurchaseWrite = Insertable<Database["webshopPurchase"]>

export interface WebshopPurchaseRepository {
  getById(id: WebshopPurchaseId): Promise<WebshopPurchase | undefined>
  getAll(take: number, cursor?: Cursor): Promise<WebshopPurchase[]>
  create(values: WebshopPurchaseWrite): Promise<WebshopPurchase | undefined>
  update(id: WebshopPurchaseId, data: WebshopPurchaseWrite): Promise<WebshopPurchase>
}

const mapToWebshopPurchase = (webshopPurchase: Selectable<Database["webshopPurchase"]>): WebshopPurchase =>
  WebshopPurchaseSchema.parse(webshopPurchase)

export class WebshopPurchaseRepositoryImpl implements WebshopPurchaseRepository {
  constructor(private readonly db: Kysely<Database>) {}

  private baseWebshopPurchaseQuery() {
    return this.db.selectFrom("webshopPurchase").selectAll()
  }

  async create(data: WebshopPurchaseWrite): Promise<WebshopPurchase | undefined> {
    const webshopPurchase = await this.db.insertInto("webshopPurchase").values(data).returningAll().executeTakeFirst()
    return webshopPurchase ? this.getById(webshopPurchase.id) : undefined
  }

  async update(id: WebshopPurchaseId, data: WebshopPurchaseWrite): Promise<WebshopPurchase> {
    await this.db.updateTable("webshopPurchase").set(data).where("id", "=", id).execute()
    return this.getById(id)
  }

  async getById(id: string): Promise<WebshopPurchase> {
    const webshopPurchase = await this.baseWebshopPurchaseQuery()
      .where("webshopPurchase.id", "=", id)
      .executeTakeFirstOrThrow()
    return mapToWebshopPurchase(webshopPurchase)
  }

  async getAll(take: number, cursor?: Cursor): Promise<WebshopPurchase[]> {
    const ordered = orderedQuery(this.baseWebshopPurchaseQuery().limit(take), cursor)
    const webshopPurchases = await ordered.execute()
    return webshopPurchases.map(mapToWebshopPurchase)
  }
}
