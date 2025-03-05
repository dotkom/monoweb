import { randomUUID } from "node:crypto"
import type { Product } from "@dotkomonline/types"
import { PrismaClient } from "@prisma/client"
import { describe, vi } from "vitest"
import { ProductNotFoundError } from "../product-error"
import { ProductRepositoryImpl } from "./../product-repository"
import { ProductServiceImpl } from "./../product-service"

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
  const productRepository = new ProductRepositoryImpl(db)
  const productService = new ProductServiceImpl(productRepository)

  it("creates a new product", async () => {
    const id = randomUUID()
    vi.spyOn(productRepository, "create").mockResolvedValueOnce({ id, ...productPayload })
    const product = await productService.createProduct(productPayload)
    expect(product).toEqual({ id, ...productPayload })
    expect(productRepository.create).toHaveBeenCalledWith(productPayload)
  })

  it("finds products by id", async () => {
    const id = randomUUID()
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce(null)
    const missing = productService.getProductById(id)
    await expect(missing).rejects.toThrow(ProductNotFoundError)
    vi.spyOn(productRepository, "getById").mockResolvedValueOnce({ id, ...productPayload })
    const real = await productService.getProductById(id)
    expect(real).toEqual({ id, ...productPayload })
  })
})
