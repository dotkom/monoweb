import { Icon } from "@dotkomonline/ui"
import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { type NextPageWithLayout } from "../_app"

const EmailPage: NextPageWithLayout = () => <div>Email</div>

const EmailHeader = () => (
    <div className="flex items-center">
      <Icon icon={"tabler:mail-filled"} width={24} />
      <p className="ml-2">Epost</p>
    </div>
  )

EmailPage.getLayout = (page) => (
    <MainLayout>
      <ProfileLayout>
        <EmailHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )

export default EmailPage
