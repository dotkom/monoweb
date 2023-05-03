import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { NextPageWithLayout } from "../_app"
import EmailView from "@/components/views/ProfileView/components/EmailView"

const EmailPage: NextPageWithLayout = () => {
  const mockEmails = ["testbruker@test.com", "nestetest@test.com"]
  return <EmailView emails={mockEmails} />
}

EmailPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
  )
}

export default EmailPage
