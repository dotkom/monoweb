import { trpc } from "@/utils/trpc";
import { type Payment } from "@dotkomonline/types";
import { Button, TextInput } from "@dotkomonline/ui";
import { type FC, useEffect, useState } from "react";

const RefundPage: FC = () => {
    const [payments, setPayments] = useState<Array<Payment>>([]);
    const [productId, setProductId] = useState("");
    const [refundFormState, setRefundFormState] = useState<{ refundablePaymentId: string; reason: string }>({
        refundablePaymentId: "",
        reason: "I need me money back :(",
    });

    const fetchPaymentsQuery = trpc.payment.all.useQuery(undefined, {
        enabled: false,
        onSuccess: (data) => {
            setPayments(data);
            const paymentId = data.find((payment) => payment.status === "PAID")?.id;

            if (paymentId) {
                setRefundFormState((prev) => ({
                    ...prev,
                    refundablePaymentId: paymentId,
                }));
            }
        },
    });

    const fetchProductQuery = trpc.payment.product.get.useQuery(productId, {
        enabled: false,
        onSuccess: (data) => {
            if (!data) {
                alert("Product not found");

                return;
            }

            if (data.refundRequiresApproval) {
                refundRequestMutation.mutate({
                    paymentId: refundFormState.refundablePaymentId,
                    reason: refundFormState.reason,
                });
            } else {
                refundPaymentMutation.mutate({ paymentId: refundFormState.refundablePaymentId });
            }
        },
    });

    const fetchRefundRequestsQuery = trpc.payment.refundRequest.all.useQuery(undefined, {
        enabled: false,
    });

    const refundPaymentMutation = trpc.payment.refundPayment.useMutation();
    const refundRequestMutation = trpc.payment.refundRequest.create.useMutation();
    const approveRefundRequestMutation = trpc.payment.refundRequest.approve.useMutation({
        onSuccess: () => {
            fetchRefundRequestsQuery.refetch();
        },
    });

    const rejectRefundRequestMutation = trpc.payment.refundRequest.reject.useMutation({
        onSuccess: () => {
            fetchRefundRequestsQuery.refetch();
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFormChange = (event: React.FormEvent<HTMLInputElement>, setState: any) => {
        const target = event.currentTarget;
        const name = target.name;
        const type = target.type;
        const value = target.value;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setState((prevState: any) => ({
            ...prevState,
            [name]: type === "number" ? parseInt(value) : value,
        }));
    };

    const handleRefundSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const payment = payments.find((payment) => payment.id === refundFormState.refundablePaymentId);

        if (!payment) {
            alert("Payment not found");

            return;
        }

        setProductId(payment.productId);

        event.preventDefault();
    };

    useEffect(() => {
        if (productId !== "") {
            fetchProductQuery.refetch();
        }
    }, [fetchProductQuery, productId]);

    return (
        <div className="[&>div]:bg-slate-2 mb-32 flex w-screen max-w-screen-lg flex-col gap-y-6 [&>div]:flex [&>div]:flex-col [&>div]:gap-y-4 [&>div]:p-8 [&_fieldset]:flex [&_fieldset]:flex-col [&_fieldset]:gap-y-1 [&_form]:flex [&_form]:flex-col [&_form]:gap-y-4">
            <h1>Refund Testing</h1>

            <div>
                <Button onClick={() => fetchPaymentsQuery.refetch()}>Fetch payments</Button>
                {fetchPaymentsQuery.isRefetching && <p>Loading...</p>}
                {fetchPaymentsQuery.data && <pre>{JSON.stringify(fetchPaymentsQuery.data, null, 2)}</pre>}
            </div>

            <div>
                <form onSubmit={handleRefundSubmit}>
                    <fieldset>
                        <label htmlFor="refundablePaymentId">Refundable PaymentId</label>
                        <TextInput
                            id="refundablePaymentId"
                            name="refundablePaymentId"
                            value={refundFormState.refundablePaymentId}
                            onChange={(e) => handleFormChange(e, setRefundFormState)}
                        />
                    </fieldset>

                    <fieldset>
                        <label htmlFor="reason">Reason</label>
                        <TextInput
                            id="reason"
                            name="reason"
                            value={refundFormState.reason}
                            onChange={(e) => handleFormChange(e, setRefundFormState)}
                        />
                    </fieldset>

                    <Button type="submit">Refund PaymentId</Button>
                    {fetchProductQuery.isRefetching && <p>Loading...</p>}
                    {refundPaymentMutation.isError && (
                        <p className="text-red-11">Error: {refundPaymentMutation.error.message}</p>
                    )}
                </form>
            </div>

            <div>
                <Button onClick={() => fetchRefundRequestsQuery.refetch()}>Fetch refund requests</Button>
                {fetchRefundRequestsQuery.isRefetching && <p>Loading...</p>}

                {fetchRefundRequestsQuery.data && (
                    <ul className="flex flex-col gap-y-4">
                        {fetchRefundRequestsQuery.data.map((refundRequest) => (
                            <li
                                className="bg-slate-1 flex h-16 flex-row items-center justify-between p-4"
                                key={refundRequest.id}
                            >
                                <p>{refundRequest.id}</p>
                                <p>{refundRequest.reason}</p>
                                <p>{refundRequest.status}</p>
                                <div className="flex flex-row gap-x-2">
                                    <Button
                                        disabled={refundRequest.status === "APPROVED"}
                                        onClick={() => approveRefundRequestMutation.mutate(refundRequest.id)}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        disabled={refundRequest.status !== "PENDING"}
                                        onClick={() => rejectRefundRequestMutation.mutate(refundRequest.id)}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {fetchRefundRequestsQuery.data && <pre>{JSON.stringify(fetchRefundRequestsQuery.data, null, 2)}</pre>}
            </div>
        </div>
    );
};

export default RefundPage;
