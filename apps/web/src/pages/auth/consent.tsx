import { AuthLayout } from "@/components/layout/AuthLayout"

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

export default ConsentPage
