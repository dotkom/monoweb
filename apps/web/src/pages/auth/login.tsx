import { AuthLayout } from "@/components/layout/AuthLayout"
import LoginForm from "@/components/organisms/LoginForm"
import { useRouter } from "next/router"

import type { NextPageWithLayout } from "../_app"

const LoginPage: NextPageWithLayout = () => {
  const router = useRouter()
  const challenge = String(router.query["login_challenge"])

  return <LoginForm challenge={challenge} />
}

LoginPage.getLayout = (page) => {
  return <AuthLayout>{page}</AuthLayout>
}

export default LoginPage
