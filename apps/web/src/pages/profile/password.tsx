import { type NextPageWithLayout } from "../_app"
import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"

const PasswordPage: NextPageWithLayout = () => <div>Password</div>

PasswordPage.getLayout = (page) => (
  <MainLayout>
    <ProfileLayout>{page}</ProfileLayout>
  </MainLayout>
)

export default PasswordPage
