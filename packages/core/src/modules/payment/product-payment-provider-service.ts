import {
    type PaymentProvider,
    type Product,
    type ProductPaymentProvider,
    type ProductPaymentProviderWrite,
} from "@dotkomonline/types";

import { type ProductPaymentProviderRepository } from "./product-payment-provider-repository";

export interface ProductPaymentProviderService {
    addPaymentProvider(data: ProductPaymentProviderWrite): Promise<ProductPaymentProvider | undefined>;
    deletePaymentProvider(productId: Product["id"], paymentProviderId: string): Promise<void>;
    getAllByProductId(productId: Product["id"]): Promise<Array<PaymentProvider>>;
    productHasPaymentProviderId(productId: Product["id"], paymentProviderId: string): Promise<boolean>;
}

export class ProductPaymentProviderServiceImpl implements ProductPaymentProviderService {
    constructor(private readonly productPaymentProviderRepository: ProductPaymentProviderRepository) {}

    async addPaymentProvider(data: ProductPaymentProviderWrite): Promise<ProductPaymentProvider | undefined> {
        return this.productPaymentProviderRepository.addPaymentProvider(data);
    }

    async deletePaymentProvider(productId: Product["id"], paymentProviderId: string): Promise<void> {
        return this.productPaymentProviderRepository.deletePaymentProvider(productId, paymentProviderId);
    }

    async getAllByProductId(productId: Product["id"]): Promise<Array<PaymentProvider>> {
        return this.productPaymentProviderRepository.getAllByProductId(productId);
    }

    async productHasPaymentProviderId(productId: Product["id"], paymentProviderId: string): Promise<boolean> {
        return this.productPaymentProviderRepository.productHasPaymentProviderId(productId, paymentProviderId);
    }
}
