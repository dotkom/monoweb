import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import AccessCardIcon from "@/components/icons/ProfileIcons/AccessCardIcon"

const AccessCardPage: NextPageWithLayout = () => {
  return <div>Access card</div>
}

const AccessCardHeader = () => {
  return (
  <div className="flex items-center">
    <AccessCardIcon/>
    <p className="ml-2">Adgangskort (NTNU)</p>
  </div>
)}

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
