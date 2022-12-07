import { AuthLayout } from "@/components/layout/AuthLayout"
import { SignupForm } from "@/components/organisms/SignupForm"
import { NextPageWithLayout } from "../_app"

const SignupPage: NextPageWithLayout = () => {
  return <SignupForm />
}

SignupPage.getLayout = (page) => <AuthLayout>{page}</AuthLayout>

export default SignupPage
