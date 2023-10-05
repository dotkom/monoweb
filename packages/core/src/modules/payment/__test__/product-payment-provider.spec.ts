import { type PaymentProvider, type Product } from "@dotkomonline/types";

import { Kysely } from "kysely";
import { type ProductPaymentProvider } from "@dotkomonline/types";
import { ProductPaymentProviderRepositoryImpl } from "../product-payment-provider-repository";
import { ProductPaymentProviderServiceImpl } from "../product-payment-provider-service";
import { productPayload } from "./product-service.spec";
import { randomUUID } from "crypto";

export const productPaymentProvidersPayload: Array<ProductPaymentProvider> = [
    {
        productId: randomUUID(),
        paymentProvider: "STRIPE",
        paymentProviderId: randomUUID(),
    },
];

export const paymentProvidersPayload: Array<PaymentProvider> = productPaymentProvidersPayload.map((payload) => ({
    paymentProvider: payload.paymentProvider,
    paymentProviderId: payload.paymentProviderId,
}));

describe("ProductPaymentProviderService", () => {
    const db = vi.mocked(Kysely.prototype);
    const productPaymentProviderRepository = new ProductPaymentProviderRepositoryImpl(db);
    const productPaymentProviderService = new ProductPaymentProviderServiceImpl(productPaymentProviderRepository);

    const productPayloadExtended: Product = {
        ...productPayload,
        id: randomUUID(),
    };

    it("should add payment provider to product", async () => {
        const productPaymentProvider = productPaymentProvidersPayload[0];
        vi.spyOn(productPaymentProviderRepository, "addPaymentProvider").mockResolvedValueOnce(productPaymentProvider);
        const result = await productPaymentProviderService.addPaymentProvider(productPaymentProvider);
        expect(result).toEqual(productPaymentProvider);
        expect(productPaymentProviderRepository.addPaymentProvider).toHaveBeenCalledWith(productPaymentProvider);
    });

    it("should delete payment provider from product", async () => {
        const productPaymentProvider = productPaymentProvidersPayload[0];
        vi.spyOn(productPaymentProviderRepository, "deletePaymentProvider").mockResolvedValueOnce(undefined);
        const result = await productPaymentProviderService.deletePaymentProvider(
            productPayloadExtended.id,
            productPaymentProvider.paymentProvider
        );

        expect(result).toEqual(undefined);
        expect(productPaymentProviderRepository.deletePaymentProvider).toHaveBeenCalledWith(
            productPayloadExtended.id,
            productPaymentProvider.paymentProvider
        );
    });

    it("should check if product has payment provider", async () => {
        const productPaymentProvider = productPaymentProvidersPayload[0];
        vi.spyOn(productPaymentProviderRepository, "productHasPaymentProviderId").mockResolvedValueOnce(true);
        const result = await productPaymentProviderService.productHasPaymentProviderId(
            productPayloadExtended.id,
            productPaymentProvider.paymentProviderId
        );

        expect(result).toEqual(true);
        expect(productPaymentProviderRepository.productHasPaymentProviderId).toHaveBeenCalledWith(
            productPayloadExtended.id,
            productPaymentProvider.paymentProviderId
        );
    });
});
