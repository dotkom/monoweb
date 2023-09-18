import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { ProfileEntryCard } from "@/components/views/ProfileView/components"

const AccessCardPage: NextPageWithLayout = () => {
  return <ProfileEntryCard />
}

AccessCardPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
  )
}

export default AccessCardPage
