import { Icon } from "@dotkomonline/ui"
import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { type NextPageWithLayout } from "../_app"

const PenaltiesPage: NextPageWithLayout = () => <div>Penalties</div>

const PenaltyHeader = () => (
    <div className="flex items-center">
      <Icon icon="pajamas:cancel" className="w-4" />
      <p className="ml-2">Prikker og Suspensjoner</p>
    </div>
  )

PenaltiesPage.getLayout = (page) => (
    <MainLayout>
      <ProfileLayout>
        <PenaltyHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )

export default PenaltiesPage
