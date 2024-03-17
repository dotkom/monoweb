import MainLayout from "@/components/layout/MainLayout"
import SettingsLayout from "@/components/layout/SettingsLayout"
import { SettingsPrivacy } from "@/components/views/SettingsView/components"
import { type NextPageWithLayout } from "../_app"

const PrivacyPage: NextPageWithLayout = () => <SettingsPrivacy />

PrivacyPage.getLayout = (page) => (
  <MainLayout>
    <SettingsLayout>{page}</SettingsLayout>
  </MainLayout>
)

export default PrivacyPage
