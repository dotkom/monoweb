import ProfileInfoBox from "@/components/organisms/ProfileComponents/ProfileInfoBox"
import ProfilePoster from "@/components/views/ProfileView"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

const ProfilePage = async () => {

  console.log("olasjkdfølkajsfd")
  const session = await getServerSession()

  if (session === null) {
    redirect("/")
  }

  console.log("saksdjfvhlkxvj.cnøaksfnession")
  // console.log(session)

  return (
    <>
      <ProfilePoster user={session.user} />
      <p>Hei på deg</p>
    </>
  )
}

export default ProfilePage
