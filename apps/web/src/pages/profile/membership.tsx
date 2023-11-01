import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { ProfileMembership } from "@/components/views/ProfileView/components"
import { Icon } from "@dotkomonline/ui"

const MembershipPage: NextPageWithLayout = () => {
  return <ProfileMembership />
}

MembershipPage.getLayout = (page) => (
  <MainLayout>
    <ProfileLayout>{page}</ProfileLayout>
  </MainLayout>
)

export default MembershipPage
