import { type NextPageWithLayout } from "../_app"
import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"

const MembershipPage: NextPageWithLayout = () => <div>Membership</div>

MembershipPage.getLayout = (page) => (
  <MainLayout>
    <ProfileLayout>{page}</ProfileLayout>
  </MainLayout>
)

export default MembershipPage
