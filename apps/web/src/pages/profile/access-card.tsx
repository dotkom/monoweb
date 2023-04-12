import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import ProfileEntryCard from "@/components/views/ProfileView/components/ProfileEntryCard"
import { NextPageWithLayout } from "../_app"

const EntryCard: NextPageWithLayout = () => {
  return <ProfileEntryCard />
}

EntryCard.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
  )
}

export default EntryCard
