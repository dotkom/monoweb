import { type Generated } from "kysely";

type PaymentProvider = "STRIPE"; // include VIPPS later
type ProductType = "EVENT"; // inlude WEBSHOP later
type PaymentStatus = "PAID" | "REFUNDED" | "UNPAID";

export interface ProductTable {
    amount: number;
    createdAt: Generated<Date>;
    deletedAt: Date | null;
    id: Generated<string>;
    isRefundable: boolean;
    objectId: null | string;
    refundRequiresApproval: boolean;
    type: ProductType;
    updatedAt: Generated<Date>;
}

export interface PaymentTable {
    createdAt: Generated<Date>;
    id: Generated<string>;
    paymentProviderId: string;
    paymentProviderOrderId: null | string;
    paymentProviderSessionId: string;
    productId: string;
    status: PaymentStatus;
    updatedAt: Generated<Date>;
    userId: string;
}

export interface ProductPaymentProviderTable {
    paymentProvider: PaymentProvider;
    paymentProviderId: string; // client_id or public_key
    productId: string;
}

export interface RefundRequestTable {
    createdAt: Generated<Date>;
    handledBy: null | string;
    id: Generated<string>;
    paymentId: string;
    reason: string;
    status: "APPROVED" | "PENDING" | "REJECTED";
    updatedAt: Generated<Date>;
    userId: string;
}
