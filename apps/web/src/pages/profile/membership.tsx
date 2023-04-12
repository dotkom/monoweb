import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import ProfileMembership from "@/components/views/ProfileView/components/ProfileMembership"
import { NextPageWithLayout } from "../_app"

const MembershipPage: NextPageWithLayout = () => {
  return <ProfileMembership />
}

MembershipPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
  )
}

export default MembershipPage
