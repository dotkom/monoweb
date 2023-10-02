import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Icon } from "@dotkomonline/ui"

const PrivacyPage: NextPageWithLayout = () => {
  return <div>Privacy</div>
}

const PrivacyHeader = () => {
  return (
    <div className="flex items-center">
      <Icon icon={"tabler:shield-half-filled"} width={24} />
      <p className="ml-2">Personvern</p>
    </div>
  )
}

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
