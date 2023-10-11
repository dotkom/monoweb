import { Icon } from "@dotkomonline/ui"
import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { type NextPageWithLayout } from "../_app"

const PrivacyPage: NextPageWithLayout = () => <div>Privacy</div>

const PrivacyHeader = () => (
    <div className="flex items-center">
      <Icon icon={"tabler:shield-half-filled"} width={24} />
      <p className="ml-2">Personvern</p>
    </div>
  )

PrivacyPage.getLayout = (page) => (
    <MainLayout>
      <ProfileLayout>
        <PrivacyHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )

export default PrivacyPage
