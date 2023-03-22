import { AuthLayout } from "@/components/layout/AuthLayout"
import { SignIn } from "@clerk/nextjs"
import { NextPageWithLayout } from "../_app"
import { dark } from "@clerk/themes"
import { useSearchParams } from "next/navigation"

const SignInPage: NextPageWithLayout = () => {
  const searchParams = useSearchParams()
  const challenge = searchParams.get("login_challenge")
  return (
    <SignIn
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      appearance={{ baseTheme: dark }}
      redirectUrl={challenge ? `/api/oauth2/login?login_challenge=${challenge}` : undefined}
    />
  )
}

SignInPage.getLayout = (page) => {
  return <AuthLayout>{page}</AuthLayout>
}

export default SignInPage
