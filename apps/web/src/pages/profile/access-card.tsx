import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Icon } from "@dotkomonline/ui"

const AccessCardPage: NextPageWithLayout = () => {
  return <div>Access card</div>
}

const AccessCardHeader = () => {
  return (
    <div className="flex items-center">
      <Icon icon={"tabler:school"} width={24} />
      <p className="ml-2">Adgangskort (NTNU)</p>
    </div>
  )
}

AccessCardPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>
        <AccessCardHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )
}

export default AccessCardPage
