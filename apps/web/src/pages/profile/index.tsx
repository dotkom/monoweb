import MainLayout from "@/components/layout/MainLayout"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import { InferGetServerSidePropsType, GetServerSideProps } from "next"
import { User, getServerSession } from "next-auth"
import { NextPageWithLayout } from "../_app"
import ProfilePoster from "@/components/views/ProfileView"

const ProfilePage: NextPageWithLayout<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ user }) => (
  <ProfilePoster user={user} />
)

ProfilePage.getLayout = (page) => <MainLayout>{page}</MainLayout>

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

export default ProfilePage
