import type { DBHandle } from "@dotkomonline/db"
import type { Product, ProductId, ProductWrite } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import { ProductNotFoundError } from "./product-error"
import type { ProductRepository } from "./product-repository"

export interface ProductService {
  create(handle: DBHandle, data: ProductWrite): Promise<Product>
  /**
   * Get product by id
   *
   * @throws {ProductNotFoundError} if product is not found
   */
  getById(handle: DBHandle, productId: ProductId): Promise<Product>
  getProducts(handle: DBHandle, page: Pageable): Promise<Product[]>
}

export function getProductService(productRepository: ProductRepository): ProductService {
  return {
    async create(handle, data) {
      return await productRepository.create(handle, data)
    },
    async getById(handle, productId) {
      const product = await productRepository.getById(handle, productId)
      if (!product) {
        throw new ProductNotFoundError(productId)
      }
      return product
    },
    async getProducts(handle, page) {
      return await productRepository.getAll(handle, page)
    },
  }
}
