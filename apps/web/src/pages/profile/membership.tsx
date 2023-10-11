import { Icon } from "@dotkomonline/ui"
import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { type NextPageWithLayout } from "../_app"

const MembershipPage: NextPageWithLayout = () => <div>Membership</div>

const MembershipHeader = () => (
    <div className="flex items-center">
      <Icon icon={"tabler:award"} width={24} />
      <p className="ml-2">Medlemskap</p>
    </div>
  )

MembershipPage.getLayout = (page) => (
    <MainLayout>
      <ProfileLayout>
        <MembershipHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )

export default MembershipPage
