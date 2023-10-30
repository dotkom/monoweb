import { type NextPageWithLayout } from "../_app"
import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"

const EmailPage: NextPageWithLayout = () => <div>Email</div>

EmailPage.getLayout = (page) => (
  <MainLayout>
    <ProfileLayout>{page}</ProfileLayout>
  </MainLayout>
)

export default EmailPage
