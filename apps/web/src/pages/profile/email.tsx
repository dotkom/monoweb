import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import { Icon } from "@dotkomonline/ui"

const EmailPage: NextPageWithLayout = () => {
  return <div>Email</div>
}

const EmailHeader = () => {
  return (
    <div className="flex items-center">
      <Icon icon={"tabler:mail-filled"} width={24} />
      <p className="ml-2">Epost</p>
    </div>
  )
}

EmailPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>
        <EmailHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )
}

export default EmailPage
