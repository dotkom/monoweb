import Checkout from "@/components/molecules/Payment/Checkout"
import { FC } from "react"
import { PaymentProvider } from "@dotkomonline/types"

const ComponentPage: FC = () => {
  const paymentProviders: PaymentProvider[] = [
    // {
    //   paymentProvider: "VIPPS",
    //   paymentProviderId: "",
    // },
    {
      paymentProvider: "STRIPE",
      paymentProviderId: "",
    },
  ]

  const base = typeof window !== "undefined" ? window.location.href : ""
  const successRedirectUrl = base + "/success"
  const cancelRedirectUrl = base + "/cancel"

  return (
    <div className="border-blue-10 w-screen max-w-[300px] border-none p-8">
      <Checkout
        productId=""
        paymentProviders={paymentProviders}
        successRedirectUrl={successRedirectUrl}
        cancelRedirectUrl={cancelRedirectUrl}
      ></Checkout>
    </div>
  )
}

export default ComponentPage