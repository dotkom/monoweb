import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Icon } from "@dotkomonline/ui"

const NotifcationPage: NextPageWithLayout = () => {
  return <div>Notification</div>
}

const NotificationHeader = () => {
  return (
    <div className="flex items-center">
      <Icon icon={"tabler:bell-ringing-filled"} width={24} />
      <p className="ml-2">Varslinger</p>
    </div>
  )
}

NotifcationPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>
        <NotificationHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )
}

export default NotifcationPage
