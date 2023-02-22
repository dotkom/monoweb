import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { ProfileLanding } from "@/components/views/ProfileView/components"
import { NextPageWithLayout } from "../_app"

const LandingPage: NextPageWithLayout = () => {
  return <ProfileLanding />
}

LandingPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
  )
}

export default LandingPage
