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
    public constructor(private readonly productPaymentProviderRepository: ProductPaymentProviderRepository) {}

    public async addPaymentProvider(data: ProductPaymentProviderWrite): Promise<ProductPaymentProvider | undefined> {
        return this.productPaymentProviderRepository.addPaymentProvider(data);
    }

    public async deletePaymentProvider(productId: Product["id"], paymentProviderId: string): Promise<void> {
        return this.productPaymentProviderRepository.deletePaymentProvider(productId, paymentProviderId);
    }

    public async getAllByProductId(productId: Product["id"]): Promise<Array<PaymentProvider>> {
        return this.productPaymentProviderRepository.getAllByProductId(productId);
    }

    public async productHasPaymentProviderId(productId: Product["id"], paymentProviderId: string): Promise<boolean> {
        return this.productPaymentProviderRepository.productHasPaymentProviderId(productId, paymentProviderId);
    }
}
