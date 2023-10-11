import { Icon } from "@dotkomonline/ui"
import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { type NextPageWithLayout } from "../_app"

const PasswordPage: NextPageWithLayout = () => <div>Password</div>

const PasswordHeader = () => (
    <div className="flex items-center">
      <Icon icon={"tabler:lock"} width={24} />
      <p className="ml-2">Passord</p>
    </div>
  )

PasswordPage.getLayout = (page) => (
    <MainLayout>
      <ProfileLayout>
        <PasswordHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )

export default PasswordPage
