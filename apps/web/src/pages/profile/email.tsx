import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import EmailIcon from "@/components/icons/ProfileIcons/EmailIcon"

const EmailPage: NextPageWithLayout = () => {
  return <div>Email</div>
}

const EmailHeader = () => {
  return (
  <div className="flex items-center">
    <EmailIcon/>
    <p className="ml-2">Epost</p>
  </div>
)}

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
