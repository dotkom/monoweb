import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Icon } from "@dotkomonline/ui"

const PaymentPage: NextPageWithLayout = () => {
  return <div>Payment</div>
}

const PaymentHeader = () => {
  return (
    <div className="flex items-center">
      <Icon icon={"tabler:credit-card"} width={24} />
      <p className="ml-2">Betalinger</p>
    </div>
  )
}

PaymentPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>
        <PaymentHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )
}

export default PaymentPage
