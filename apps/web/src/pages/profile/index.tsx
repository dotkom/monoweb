import { type GetServerSideProps, type InferGetServerSidePropsType } from "next"
import { getServerSession, type User } from "next-auth"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { ProfileLanding } from "@/components/views/ProfileView/components"
import { type NextPageWithLayout } from "../_app"

const LandingPage: NextPageWithLayout<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ user }) => (
  <ProfileLanding user={user} />
)

LandingPage.getLayout = (page) => (
  <MainLayout>
    <ProfileLayout>{page}</ProfileLayout>
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
