import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import ProfileNotifications from "@/components/views/ProfileView/components/ProfileNotifications"

const NotifcationPage: NextPageWithLayout = () => {
  return <ProfileNotifications />
}

NotifcationPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
  )
}

export default NotifcationPage
