import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import NotificationIcon from "@/components/icons/ProfileIcons/NotificationIcon"

const NotifcationPage: NextPageWithLayout = () => {
  return <div>Notification</div>
}

const NotificationHeader = () => {
  return (
  <div className="flex items-center">
    <NotificationIcon/>
    <p className="ml-2">Varslinger</p>
  </div>
)}

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
