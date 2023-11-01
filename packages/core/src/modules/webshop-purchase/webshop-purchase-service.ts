import { WebshopPurchase, WebshopPurchaseId, WebshopPurchaseWrite } from "@dotkomonline/types"
import { NotFoundError } from "../../errors/errors"
import { Cursor } from "../../utils/db-utils"
import { WebshopPurchaseRepository } from "./webshop-purchase-repository"

export interface WebshopPurchaseService {
  get(id: WebshopPurchaseId): Promise<WebshopPurchase>
  getAll(take: number, cursor?: Cursor): Promise<WebshopPurchase[]>
  create(payload: WebshopPurchaseWrite): Promise<WebshopPurchase>
  update(id: WebshopPurchaseId, payload: WebshopPurchaseWrite): Promise<WebshopPurchase>
}

export class WebshopPurchaseServiceImpl implements WebshopPurchaseService {
  constructor(private readonly webshopPurchaseRepository: WebshopPurchaseRepository) {}

  async get(id: WebshopPurchaseId): Promise<WebshopPurchase> {
    const webshopPurchase = await this.webshopPurchaseRepository.getById(id)
    if (!webshopPurchase) throw new NotFoundError(`WebshopPurchase with ID:${id} not found`)
    return webshopPurchase
  }

  async getAll(take: number, cursor?: Cursor): Promise<WebshopPurchase[]> {
    const webshopPurchases = await this.webshopPurchaseRepository.getAll(take, cursor)
    return webshopPurchases
  }

  async create(payload: WebshopPurchaseWrite): Promise<WebshopPurchase> {
    const webshopPurchase = await this.webshopPurchaseRepository.create(payload)
    if (!webshopPurchase) throw new Error("Failed to create webshopPurchase")

    return webshopPurchase
  }

  async update(id: WebshopPurchaseId, payload: WebshopPurchaseWrite): Promise<WebshopPurchase> {
    const webshopPurchase = await this.webshopPurchaseRepository.update(id, payload)

    return webshopPurchase
  }
}
