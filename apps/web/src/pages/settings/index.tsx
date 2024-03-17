import { type GetServerSideProps, type InferGetServerSidePropsType } from "next"
import { getServerSession, type User } from "next-auth"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import MainLayout from "@/components/layout/MainLayout"
import SettingsLayout from "@/components/layout/SettingsLayout"
import { SettingsLanding } from "@/components/views/SettingsView/components"
import { type NextPageWithLayout } from "../_app"

const LandingPage: NextPageWithLayout<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ user }) => (
  <SettingsLanding user={user} />
)

LandingPage.getLayout = (page) => (
  <MainLayout>
    <SettingsLayout>{page}</SettingsLayout>
  </MainLayout>
)

export const getServerSideProps: GetServerSideProps<{ user: User }> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions)
  if (session === null) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }
  return {
    props: {
      user: session.user,
    },
  }
}

export default LandingPage
