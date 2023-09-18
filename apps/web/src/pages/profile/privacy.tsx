import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { ProfilePrivacy } from "@/components/views/ProfileView/components"

const PrivacyPage: NextPageWithLayout = () => {
  return <ProfilePrivacy />
}

PrivacyPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
  )
}

export default PrivacyPage
