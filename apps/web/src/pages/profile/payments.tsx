import { Icon } from "@dotkomonline/ui"
import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { type NextPageWithLayout } from "../_app"

const PaymentPage: NextPageWithLayout = () => <div>Payment</div>

const PaymentHeader = () => (
  <div className="flex items-center">
    <Icon icon={"tabler:credit-card"} width={24} />
    <p className="ml-2">Betalinger</p>
  </div>
)

PaymentPage.getLayout = (page) => (
  <MainLayout>
    <ProfileLayout>
      <PaymentHeader />
      {page}
    </ProfileLayout>
  </MainLayout>
)

export default PaymentPage
