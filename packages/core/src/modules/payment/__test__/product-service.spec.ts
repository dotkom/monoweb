import { type Product } from "@dotkomonline/types";
import { randomUUID } from "crypto";
import { Kysely } from "kysely";
import { describe, vi } from "vitest";

import { NotFoundError } from "../../../errors/errors";
import { ProductRepositoryImpl } from "./../product-repository";
import { ProductServiceImpl } from "./../product-service";

export const productPayload: Omit<Product, "id"> = {
    amount: 999,
    createdAt: new Date(2022, 1, 1),
    deletedAt: null,
    isRefundable: true,
    objectId: randomUUID(),
    paymentProviders: [],
    refundRequiresApproval: true,
    type: "EVENT",
    updatedAt: new Date(2022, 1, 1),
};

describe("ProductService", () => {
    const db = vi.mocked(Kysely.prototype);
    const productRepository = new ProductRepositoryImpl(db);
    const productService = new ProductServiceImpl(productRepository);

    it("creates a new product", async () => {
        const id = randomUUID();
        vi.spyOn(productRepository, "create").mockResolvedValueOnce({ id, ...productPayload });
        const product = await productService.createProduct(productPayload);
        expect(product).toEqual({ id, ...productPayload });
        expect(productRepository.create).toHaveBeenCalledWith(productPayload);
    });

    it("finds products by id", async () => {
        const id = randomUUID();
        vi.spyOn(productRepository, "getById").mockResolvedValueOnce(undefined);
        const missing = productService.getProductById(id);
        await expect(missing).rejects.toThrow(NotFoundError);
        vi.spyOn(productRepository, "getById").mockResolvedValueOnce({ id, ...productPayload });
        const real = await productService.getProductById(id);
        expect(real).toEqual({ id, ...productPayload });
    });
});
