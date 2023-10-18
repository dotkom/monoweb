import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { ProfileMembership } from "@/components/views/ProfileView/components"
import { Icon } from "@dotkomonline/ui"

const MembershipPage: NextPageWithLayout = () => {
  return <ProfileMembership />
}

const MembershipHeader = () => {
  return (
    <div className="flex items-center">
      <Icon icon={"tabler:award"} width={24} />
      <p className="ml-2">Medlemskap</p>
    </div>
  )
}

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
