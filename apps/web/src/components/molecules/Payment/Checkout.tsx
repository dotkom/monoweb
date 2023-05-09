import { PaymentProvider, Product } from "@dotkomonline/types"

import { FC, useState } from "react"
import StripeButton from "./StripeButton"
// import VippsButton from "./VippsButton"
import { trpc } from "@/utils/trpc"
import { useRouter } from "next/router"
import ProcessPaymentButton from "./ProcessPaymentButton"
import { Icon } from "@dotkomonline/ui"

export interface CheckoutProps {
  productId: Product["id"]
  paymentProviders: PaymentProvider[]
  successRedirectUrl: string
  cancelRedirectUrl: string
}

// TODO: Add loading spinner or something on click

const Checkout: FC<CheckoutProps> = (props: CheckoutProps) => {
  const { productId, paymentProviders, successRedirectUrl, cancelRedirectUrl } = props
  const router = useRouter()

  const handleSuccessMutation = ({ redirectUrl }: { redirectUrl: string }) => {
    router.push(redirectUrl)
  }

  const createStripeCheckoutMutation = trpc.payment.createStripeCheckoutSession.useMutation({
    onSuccess: handleSuccessMutation,
  })
  // const createVippsCheckoutMutation = trpc.payment.createVippsCheckoutSession.useMutation({
  //   onSuccess: handleSuccessMutation,
  // })
  const [isLoading, setIsLoading] = useState(true)

  const handleClick = (provider: PaymentProvider) => {
    switch (provider.paymentProvider) {
      case "STRIPE":
        // createStripeCheckoutMutation.mutate({
        //   productId,
        //   stripePublicKey: provider.paymentProviderId,
        //   successRedirectUrl,
        //   cancelRedirectUrl,
        // })
        setIsLoading(true)
        break
      // case "VIPPS":
      //   createVippsCheckoutMutation.mutate({
      //     productId,
      //     vippsClientId: provider.paymentProviderId,
      //     redirectUrl: successRedirectUrl,
      //   })
      //   break
      default:
        break
    }
  }

  const getButtonComponent = (provider: PaymentProvider): JSX.Element => {
    switch (provider.paymentProvider) {
      case "STRIPE":
        return <StripeButton isLoading={isLoading} onClick={() => handleClick(provider)} />
        // return (
        //   <ProcessPaymentButton onClick={() => handleClick(provider)}>
        //     <Icon icon="fa6-brands:stripe" style={{ color: "white" }} width="52" />
        //   </ProcessPaymentButton>
        // )
      // case "VIPPS":
      //   return <VippsButton onClick={() => handleClick(provider)} />
      default:
        return <p>Unknown payment provider</p>
    }
  }

  return (
    <div>
      <ul className="flex flex-col gap-y-2">
        {paymentProviders.map((provider) => (
          <li key={provider.paymentProvider}>{getButtonComponent(provider)}</li>
        ))}
      </ul>
    </div>
  )
}

export default Checkout
