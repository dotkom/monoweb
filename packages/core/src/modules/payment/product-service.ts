import type { Product, ProductId, ProductWrite } from "@dotkomonline/types"
import type { Pageable } from "../../query"
import { ProductNotFoundError } from "./product-error"
import type { ProductRepository } from "./product-repository"

export interface ProductService {
  createProduct(productCreate: ProductWrite): Promise<Product>
  getProductById(id: ProductId): Promise<Product>
  getProducts(page: Pageable): Promise<Product[]>
}

export class ProductServiceImpl implements ProductService {
  private readonly productRepository: ProductRepository

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository
  }

  async createProduct(productCreate: ProductWrite): Promise<Product> {
    const product = await this.productRepository.create(productCreate)
    return product
  }

  /**
   * Get product by id
   *
   * @throws {ProductNotFoundError} if product is not found
   */
  async getProductById(id: ProductId): Promise<Product> {
    const product = await this.productRepository.getById(id)
    if (!product) {
      throw new ProductNotFoundError(id)
    }
    return product
  }

  async getProducts(page: Pageable): Promise<Product[]> {
    const products = await this.productRepository.getAll(page)
    return products
  }
}
