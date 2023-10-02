import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Icon } from "@dotkomonline/ui"

const PasswordPage: NextPageWithLayout = () => {
  return <div>Password</div>
}

const PasswordHeader = () => {
  return (
    <div className="flex items-center">
      <Icon icon={"tabler:lock"} width={24} />
      <p className="ml-2">Passord</p>
    </div>
  )
}

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
