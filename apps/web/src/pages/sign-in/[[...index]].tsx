import { AuthLayout } from "@/components/layout/AuthLayout"
import { SignIn } from "@clerk/nextjs"
import { NextPageWithLayout } from "../_app"
import { dark } from "@clerk/themes"

const SignInPage: NextPageWithLayout = () => (
  <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" appearance={{ baseTheme: dark }} />
)

SignInPage.getLayout = (page) => {
  return <AuthLayout>{page}</AuthLayout>
}

export default SignInPage
