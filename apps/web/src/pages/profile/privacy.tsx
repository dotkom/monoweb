import MainLayout from "@/components/layout/MainLayout"
import ProfileLayout from "@/components/layout/ProfileLayout"
import { trpc } from "@/utils/trpc"
import { useSession } from "@clerk/nextjs"
import { Button } from "@dotkomonline/ui"
import { NextPageWithLayout } from "../_app"

type Profile = {
  userId: string
  updatedAt?: Date
  showName: boolean
  visibleForOtherUsers: boolean
  showEmail: boolean
  showAdress: boolean
  visibleInEvents: boolean
  allowPictures: boolean
}

const PrivacyPage: NextPageWithLayout = () => {

  const { session } = useSession()
  const { mutate: createProfile, data: createdProfile } = trpc.profile.create.useMutation()
  const { mutate: getPrivacy, data: privacy } = trpc.profile.get.useQuery({session.id})
 
  const handleUpdate = () => {
    if (!session) return
    const profile: Profile = {
      allowPictures: true,
      visibleInEvents: true,
      showAdress: true,
      showEmail: true,
      showName: true,
      userId: session.id,
      visibleForOtherUsers: true,
    }
    mutate(profile)
  }
  return (
    <>
      <Button onClick={handleUpdate}>Privacy</Button>
      <p>{JSON.stringify(data)}</p>
    </>
  )
}

PrivacyPage.getLayout = (page) => {
  return (
    <MainLayout>
      <ProfileLayout>{page}</ProfileLayout>
    </MainLayout>
  )
}

export default PrivacyPage
