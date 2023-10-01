import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { ProfileLanding } from "@/components/views/ProfileView/components"
import { NextPageWithLayout } from "../_app"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { getServerSession, User } from "next-auth"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import AccountIcon from "@/components/icons/ProfileIcons/AccountIcon"

const LandingPage: NextPageWithLayout<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ user }) => {
  return <ProfileLanding user={user} />
}

const LandingPageHeader = () => {
  return (
  <div className="flex items-center">
    <AccountIcon/>
    <p className="ml-2">Min Profil</p>
  </div>
)}

LandingPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>
        <LandingPageHeader />
        {page}
      </ProfileLayout>
    </MainLayout>
  )
}

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
