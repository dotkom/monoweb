import { AuthLayout } from "@/components/layout/AuthLayout"
import LoginForm from "@/components/organisms/LoginForm"
import { trpcClient } from "@/utils/trpc"
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next"
import { getSession } from "next-auth/react"

import type { NextPageWithLayout } from "../_app"

type LoginNextPage = NextPageWithLayout<InferGetServerSidePropsType<typeof getServerSideProps>>

const LoginPage: LoginNextPage = (props) => {
  return <LoginForm challenge={props.challenge} />
}

LoginPage.getLayout = (page) => {
  return <AuthLayout>{page}</AuthLayout>
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context)
  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }
  const { query } = context
  const challenge = query["login_challenge"] as string
  if (!challenge) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    }
  }
  // Attempt to bypass login screen
  const login = await trpcClient.auth.skipLogin.mutate({ challenge })
  // redirect if the response is a link
  if ("redirectTo" in login) {
    return {
      redirect: {
        destination: login.redirectTo,
        permanent: false,
      },
    }
  }
  return {
    props: {
      challenge,
    },
  }
}

export default LoginPage
