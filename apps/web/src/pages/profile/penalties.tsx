import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import PenaltyIcon from "@/components/icons/ProfileIcons/PenaltyIcon"

const PenaltiesPage: NextPageWithLayout = () => {
  return <div>Penalties</div>
}

const PenaltyHeader = () => {
  return (
  <div className="flex items-center">
    <PenaltyIcon/>
    <p className="ml-2">Prikker og Suspensjoner</p>
  </div>
)}

PenaltiesPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>
        <PenaltyHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )
}

export default PenaltiesPage
