import { AuthLayout } from "@/components/layout/AuthLayout"
import { trpcClient } from "@/utils/trpc"
import { GetServerSidePropsContext } from "next"

import { NextPageWithLayout } from "../_app"

const ConsentPage: NextPageWithLayout = () => {
  return (
    <form>
      <h1>Consent</h1>
    </form>
  )
}

ConsentPage.getLayout = (page) => {
  return <AuthLayout>{page}</AuthLayout>
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { query } = ctx
  const challenge = query["consent_challenge"] as string
  // Autoskip this screen
  const consentRes = await trpcClient.auth.consent.mutate({ challenge })
  return {
    redirect: {
      destination: consentRes.redirectTo,
      permanent: false,
    },
  }
}

export default ConsentPage
