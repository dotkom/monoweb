import { Icon } from "@dotkomonline/ui"
import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { type NextPageWithLayout } from "../_app"

const NotifcationPage: NextPageWithLayout = () => <div>Notification</div>

const NotificationHeader = () => (
  <div className="flex items-center">
    <Icon icon={"tabler:bell-ringing-filled"} width={24} />
    <p className="ml-2">Varslinger</p>
  </div>
)

NotifcationPage.getLayout = (page) => (
  <MainLayout>
    <ProfileLayout>
      <NotificationHeader />
      {page}
    </ProfileLayout>
  </MainLayout>
)

export default NotifcationPage
