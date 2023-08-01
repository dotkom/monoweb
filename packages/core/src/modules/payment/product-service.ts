import { Product, ProductWrite } from "@dotkomonline/types"

import { Cursor } from "../../utils/db-utils"
import { NotFoundError } from "../../errors/errors"
import { ProductRepository } from "./product-repository"

export interface ProductService {
  createProduct(productCreate: ProductWrite): Promise<Product>
  getProductById(id: Product["id"]): Promise<Product>
  getProducts(take: number, cursor?: Cursor): Promise<Product[]>
}

export class ProductServiceImpl implements ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async createProduct(productCreate: ProductWrite): Promise<Product> {
    const product = await this.productRepository.create(productCreate)
    if (!product) {
      throw new Error("Failed to create product")
    }
    return product
  }

  async getProductById(id: Product["id"]): Promise<Product> {
    const product = await this.productRepository.getById(id)
    if (!product) {
      throw new NotFoundError("Could not find the product")
    }
    return product
  }

  async getProducts(take: number, cursor?: Cursor): Promise<Product[]> {
    const products = await this.productRepository.getAll(take, cursor)
    return products
  }
}
