import { type Product, type ProductWrite } from "@dotkomonline/types";

import { NotFoundError } from "../../errors/errors";
import { type Cursor } from "../../utils/db-utils";
import { type ProductRepository } from "./product-repository";

export interface ProductService {
    createProduct(productCreate: ProductWrite): Promise<Product>;
    getProductById(id: Product["id"]): Promise<Product>;
    getProducts(take: number, cursor?: Cursor): Promise<Array<Product>>;
}

export class ProductServiceImpl implements ProductService {
    public constructor(private readonly productRepository: ProductRepository) {}

    public async createProduct(productCreate: ProductWrite): Promise<Product> {
        const product = await this.productRepository.create(productCreate);

        if (!product) {
            throw new Error("Failed to create product");
        }

        return product;
    }

    public async getProductById(id: Product["id"]): Promise<Product> {
        const product = await this.productRepository.getById(id);

        if (!product) {
            throw new NotFoundError("Could not find the product");
        }

        return product;
    }

    public async getProducts(take: number, cursor?: Cursor): Promise<Array<Product>> {
        const products = await this.productRepository.getAll(take, cursor);

        return products;
    }
}
