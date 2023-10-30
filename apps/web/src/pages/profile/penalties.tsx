import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Icon } from "@dotkomonline/ui"

const PenaltiesPage: NextPageWithLayout = () => {
  return <div>Penalties</div>
}

const PenaltyHeader = () => {
  return (
    <div className="flex items-center">
      <Icon icon="pajamas:cancel" className="w-4" />
      <p className="ml-2">Prikker og Suspensjoner</p>
    </div>
  )
}

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
