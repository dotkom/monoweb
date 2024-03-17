import MainLayout from "@/components/layout/MainLayout"
import SettingsLayout from "@/components/layout/SettingsLayout"
import { type NextPageWithLayout } from "../_app"

const NotificationPage: NextPageWithLayout = () => <div>Notifications</div>

NotificationPage.getLayout = (page) => (
  <MainLayout>
    <SettingsLayout>{page}</SettingsLayout>
  </MainLayout>
)

export default NotificationPage
