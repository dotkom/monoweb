import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import PasswordIcon from "@/components/icons/ProfileIcons/PasswordIcon"

const PasswordPage: NextPageWithLayout = () => {
  return <div>Password</div>
}

const PasswordHeader = () => {
  return (
  <div className="flex items-center">
    <PasswordIcon/>
    <p className="ml-2">Passord</p>
  </div>
)}

PasswordPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>
        <PasswordHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )
}

export default PasswordPage
