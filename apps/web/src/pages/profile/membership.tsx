import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import MembershipIcon from "@/components/icons/ProfileIcons/MembershipIcon"

const MembershipPage: NextPageWithLayout = () => {
  return <div>Membership</div>
}

const MembershipHeader = () => {
  return (
  <div className="flex items-center">
    <MembershipIcon/>
    <p className="ml-2">Medlemskap</p>
  </div>
)}

MembershipPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>
        <MembershipHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )
}

export default MembershipPage
