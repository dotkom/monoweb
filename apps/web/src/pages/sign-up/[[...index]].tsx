import { AuthLayout } from "@/components/layout/AuthLayout"
import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { NextPageWithLayout } from "../_app"

const SignUpPage: NextPageWithLayout = () => (
  <SignUp
    path="/sign-up"
    routing="path"
    signInUrl="/sign-in"
    appearance={{
      baseTheme: dark,
    }}
  />
)

SignUpPage.getLayout = (page) => {
  return <AuthLayout>{page}</AuthLayout>
}

export default SignUpPage
