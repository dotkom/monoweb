import { randomUUID } from "node:crypto"
import type { Product } from "@dotkomonline/types"
import { PrismaClient } from "@prisma/client"
import { describe, vi } from "vitest"
import { ProductNotFoundError } from "../product-error"
import { getProductRepository } from "../product-repository"
import { getProductService } from "../product-service"

// biome-ignore lint/suspicious/noExportsInTest: this is shared across multiple tests
export const productPayload: Omit<Product, "id"> = {
  createdAt: new Date(2022, 1, 1),
  updatedAt: new Date(2022, 1, 1),
  type: "EVENT",
  objectId: randomUUID(),
  amount: 999,
  paymentProviders: [],
  isRefundable: true,
  refundRequiresApproval: true,
  deletedAt: null,
}

describe("ProductService", () => {
  const db = vi.mocked(PrismaClient.prototype)
  const productRepository = getProductRepository()
  const productService = getProductService(productRepository)

  it("creates a new product", async () => {
    const id = randomUUID()
    vi.spyOn(productRepository, "create").mockResolvedValueOnce({ id, ...productPayload })
    const product = await productService.create(db, productPayload)
    expect(product).toEqual({ id, ...productPayload })
    expect(productRepository.create).toHaveBeenCalledWith(db, productPayload)
  })

  it("finds products by id", async () => {
    const id = randomUUID()
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce(null)
    const missing = productService.getById(db, id)
    await expect(missing).rejects.toThrow(ProductNotFoundError)
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce({ id, ...productPayload })
    const real = await productService.getById(db, id)
    expect(real).toEqual({ id, ...productPayload })
  })
})
