import { Icon } from "@dotkomonline/ui"
import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { type NextPageWithLayout } from "../_app"

const AccessCardPage: NextPageWithLayout = () => <div>Access card</div>

const AccessCardHeader = () => (
    <div className="flex items-center">
      <Icon icon={"tabler:school"} width={24} />
      <p className="ml-2">Adgangskort (NTNU)</p>
    </div>
  )

AccessCardPage.getLayout = (page) => (
    <MainLayout>
      <ProfileLayout>
        <AccessCardHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )

export default AccessCardPage
