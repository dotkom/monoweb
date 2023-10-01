import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import PrivacyIcon from "@/components/icons/ProfileIcons/PrivacyIcon"

const PrivacyPage: NextPageWithLayout = () => {
  return <div>Privacy</div>
}

const PrivacyHeader = () => {
  return (
  <div className="flex items-center">
    <PrivacyIcon/>
    <p className="ml-2">Personvern</p>
  </div>
)}

PrivacyPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>
        <PrivacyHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )
}

export default PrivacyPage
