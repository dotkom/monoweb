import type { Product, ProductId, ProductWrite } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import { ProductNotFoundError } from "./product-error"
import type { ProductRepository } from "./product-repository"

export interface ProductService {
  create(data: ProductWrite): Promise<Product>
  /**
   * Get product by id
   *
   * @throws {ProductNotFoundError} if product is not found
   */
  getById(productId: ProductId): Promise<Product>
  getProducts(page: Pageable): Promise<Product[]>
}

export class ProductServiceImpl implements ProductService {
  private readonly productRepository: ProductRepository

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository
  }

  public async create(data: ProductWrite) {
    const product = await this.productRepository.create(data)
    return product
  }

  public async getById(productId: ProductId) {
    const product = await this.productRepository.getById(productId)
    if (!product) {
      throw new ProductNotFoundError(productId)
    }
    return product
  }

  public async getProducts(page: Pageable) {
    const products = await this.productRepository.getAll(page)
    return products
  }
}
