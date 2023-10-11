import { type GetServerSideProps, type InferGetServerSidePropsType } from "next"
import { getServerSession, type User } from "next-auth"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import { Icon } from "@dotkomonline/ui"
import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { ProfileLanding } from "@/components/views/ProfileView/components"
import { type NextPageWithLayout } from "../_app"

const LandingPage: NextPageWithLayout<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ user }) => <ProfileLanding user={user} />

const LandingPageHeader = () => (
    <div className="flex items-center">
      <Icon icon={"tabler:user-circle"} width={24} />
      <p className="ml-2">Min Profil</p>
    </div>
  )

LandingPage.getLayout = (page) => (
    <MainLayout>
      <ProfileLayout>
        <LandingPageHeader />
        {page}
      </ProfileLayout>
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
