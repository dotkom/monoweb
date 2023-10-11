// THIS FILE IS TEMPORARY. NO NEED TO REVIEW IT.

import React, { type FC, type FormEvent, useState } from "react"
import { type ProductWrite } from "@dotkomonline/types"
import { useRouter } from "next/router"
import { trpc } from "@/utils/trpc"

const PaymentTestPage: FC = () => {
  const paymentProvidersQuery = trpc.payment.getPaymentProviders.useQuery(undefined, {
    enabled: false,
  })
  const productsQuery = trpc.payment.product.all.useQuery(undefined, {
    enabled: false,
    onSuccess: (data) => {
      setProductId(data[0]?.id ?? "")
      setProviderId(data[0]?.paymentProviders[0]?.paymentProviderId ?? "")
    },
  })

  const [isSeeding, setIsSeeding] = useState(false)

  const createProductMutation = trpc.payment.product.create.useMutation({
    onSuccess: () => {
      productsQuery.refetch()
    },
  })

  const [isShowingCreateProductForm, setIsShowingCreateProductForm] = useState(false)
  const [createProductFormState, setCreateProductFormState] = useState<ProductWrite>({
    type: "EVENT",
    objectId: "6b0e48c1-bc27-4901-9cc9-31c8076ef5ac",
    amount: 6969,
    isRefundable: true,
    refundRequiresApproval: true,
  })

  const router = useRouter()
  const [productId, setProductId] = useState("")
  const [providerId, setProviderId] = useState("")
  const [paymentId, setPaymentId] = useState("")
  const [isActuallyLoading, setIsActuallyLoading] = useState(false)

  const createCheckout = trpc.payment.createStripeCheckoutSession.useMutation({
    onSuccess: (data) => {
      router.push(data.redirectUrl)
    },
  })

  const fetchProduct = trpc.payment.product.get.useQuery(productId, {
    enabled: false,
  })

  const refundPayment = trpc.payment.refundPayment.useMutation({
    onSuccess: () => {
      alert("Successfully Refunded!")
    },
  })

  const changeEvent = (event: FormEvent<HTMLInputElement>) => {
    const target = event.currentTarget
    const name = target.name
    const type = target.type

    const value = type === "number" ? Number(target.value) : target.value

    setCreateProductFormState((pre) => ({ ...pre, [name]: value }))
  }

  const onCheckoutClick = () => {
    createCheckout.mutate({
      productId,
      stripePublicKey: providerId,
      successRedirectUrl: `${window.location.href}/success`,
      cancelRedirectUrl: `${window.location.href}/cancel`,
    })
  }

  const onFetchClick = () => {
    setIsActuallyLoading(true)
    fetchProduct.refetch()
  }

  const onRefundClick = () => {
    refundPayment.mutate({
      paymentId,
    })
  }

  const seedPaymentProvidersQuery = trpc.payment.getPaymentProviders.useQuery(undefined, {
    enabled: false,
    onSuccess: () => {
      seedEventsQuery.refetch()
    },
  })

  // Seeding stuff

  const seedAddProductPaymentProviderMutation = trpc.payment.product.addPaymentProvider.useMutation({
    onSuccess: (data) => {
      setProductId(data?.productId ?? "")
      setProviderId(data?.paymentProviderId ?? "")
      setIsSeeding(false)
    },
  })

  const seedCreateProductMutation = trpc.payment.product.create.useMutation({
    onSuccess: (data) => {
      const stripeProvider = seedPaymentProvidersQuery.data?.find((p) => p.paymentProvider === "STRIPE")

      if (stripeProvider) {
        seedAddProductPaymentProviderMutation.mutate({
          productId: data.id,
          paymentProvider: "STRIPE",
          paymentProviderId: stripeProvider.paymentProviderId,
        })
      }
    },
  })

  const seedEventsQuery = trpc.event.all.useQuery(undefined, {
    enabled: false,
    onSuccess: (data) => {
      const goodEvents = data.filter((e) => Boolean(e.id))

      for (let i = 0; i < Math.min(2, goodEvents.length); i++) {
        seedCreateProductMutation.mutate({
          type: "EVENT",
          objectId: data[i].id,
          amount: i === 0 ? 250 : 2300,
          isRefundable: true,
          refundRequiresApproval: true,
        })
      }
    },
  })

  const onSeedClick = () => {
    setIsSeeding(true)
    seedPaymentProvidersQuery.refetch()
  }

  return (
    <div className="[&_button]:bg-blue-5 [&_input]:border-blue [&_input]:bg-blue-3 mb-32 flex w-screen max-w-screen-md flex-col gap-y-4 [&_button]:mx-1 [&_button]:p-4 [&_input]:my-1 [&_input]:rounded-md [&_input]:p-2 [&_label]:mr-2">
      <h1>Payment Test</h1>

      {/* Use migration fixtures instead */}
      <button onClick={onSeedClick} className="hidden">
        Create and insert seed data
      </button>
      {isSeeding && <p>Seeding...</p>}

      <div>
        <h3>Products</h3>
        <button onClick={() => productsQuery.refetch()}>Fetch data</button>
        <button onClick={() => setIsShowingCreateProductForm(true)}>Create product</button>
        {isShowingCreateProductForm && (
          <form
            onSubmit={(e) => {
              createProductMutation.mutate(createProductFormState)
              e.preventDefault()
            }}
            className="p-8"
          >
            <fieldset>
              <label htmlFor="type">Type</label>
              <input type="text" id="type" name="type" value={createProductFormState.type} onChange={changeEvent} />
            </fieldset>

            <fieldset>
              <label htmlFor="objectId">ObjectId</label>
              <input
                type="text"
                id="objectId"
                name="objectId"
                value={createProductFormState.objectId ?? ""}
                onChange={changeEvent}
              />
            </fieldset>

            <fieldset>
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={createProductFormState.amount}
                onChange={changeEvent}
              />
            </fieldset>

            <br />
            <button type="submit">Create</button>
          </form>
        )}
        <pre>{JSON.stringify(productsQuery.data, null, 4)}</pre>
      </div>

      <div>
        <h3>Payment providers</h3>
        <button onClick={() => paymentProvidersQuery.refetch()}>Fetch data</button>
        <pre>{JSON.stringify(paymentProvidersQuery.data, null, 4)}</pre>
      </div>

      <h3>Testing</h3>

      <fieldset className="flex flex-col gap-y-1">
        <label htmlFor="productId">ProductId</label>
        <input id="productId" type="text" value={productId} onChange={(e) => setProductId(e.target.value)} />
      </fieldset>

      <fieldset className="flex flex-col gap-y-1">
        <label htmlFor="providerId">ProviderId (Stripe Public Key)</label>
        <input id="providerId" type="text" value={providerId} onChange={(e) => setProviderId(e.target.value)} />
      </fieldset>

      <fieldset className="flex flex-col gap-y-1">
        <label htmlFor="stripeWebhookCommand">Stripe Local Webhook Command (copy only)</label>
        <input
          id="stripeWebhookCommand"
          type="text"
          readOnly
          value={providerId ? `stripe listen --forward-to localhost:3000/api/webhooks/stripe/${providerId}` : ""}
        />
      </fieldset>

      <button onClick={onCheckoutClick} className="border-blue-7 hover:border-blue-8 rounded-md border p-2">
        Proceed to stripe checkout
      </button>

      <button onClick={onFetchClick} className="border-blue-7 hover:border-blue-8 rounded-md border p-2">
        Fetch product data
      </button>

      {((isActuallyLoading && fetchProduct.isLoading) || createCheckout.isLoading) && <div>Loading...</div>}

      {fetchProduct.data && <pre>{JSON.stringify(fetchProduct.data, null, 4)}</pre>}

      <fieldset className="flex flex-col gap-y-1">
        <label htmlFor="paymentId">PaymentId</label>
        <input id="paymentId" type="text" value={paymentId} onChange={(e) => setPaymentId(e.target.value)} />
      </fieldset>

      <button onClick={onRefundClick} className="border-blue-7 hover:border-blue-8 rounded-md border p-2">
        Refund PaymentId
      </button>
    </div>
  )
}

export default PaymentTestPage
